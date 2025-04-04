const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path');
const { HOST, PORT } = require('./config')

app.set('views', 'views')
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.locals.baseURL = HOST;

const rooms = {}

app.get('/', (req, res) => {
	res.render('index', { rooms, roomName: '' })
})

app.get('/room/:id', (req, res) => {
	if (rooms[req.params.id] == null) {
		return res.redirect('/')
	}
	res.render('room', { roomName: req.params.id })
})

app.post('/room', (req, res) => {
	if (rooms[req.body.room] != null) {
		return res.redirect('/')
	}
	rooms[req.body.room] = { users: {} }
	res.redirect(`room/${req.body.room}`)
	// Send message that new room was created
	io.emit('room-created', req.body.room)
})

server.listen(PORT, () => console.info(`Server listening PORT: ${PORT} :)`))


io.on('connection', socket => {
	socket.on('new-user', (room, name) => {
		socket.join(room)
		rooms[room].users[socket.id] = name
		socket.to(room).broadcast.emit('user-connected', name)
	})

	socket.on('send-chat-message', (room, message) => {
		socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
	})

	socket.on('disconnect', () => {
		getUserRooms(socket).forEach(room => {
			socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
			delete rooms[room].users[socket.id]
		})
	})
})


function getUserRooms(socket) {
	return Object.entries(rooms).reduce((names, [name, room]) => {
		if (room.users[socket.id] != null) names.push(name)
			return names
	}, [])
}
