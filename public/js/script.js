const socket = io(baseURL)
const messageContainer = document.getElementById('message-container')
// const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

if (messageForm != null) {
    let name;
    while(!name){
        name = prompt('What is your name?')
    };
    
    appendMessage('You joined.', 'alert alert-success')
    socket.emit('new-user', roomName, name)

    messageForm.addEventListener('submit', e => {
        e.preventDefault()
        const message = messageInput.value
        appendMessage(`You: ${message}`, 'you-message')
        socket.emit('send-chat-message', roomName, message)
        messageInput.value = ''
    })
}

// socket.on('room-created', room => {
//     const roomElement = document.createElement('div')
//     roomElement.innerText = room
//     const roomLink = document.createElement('a')
//     roomLink.href = `/${room}`
//     roomLink.innerText = 'join'
//     roomContainer.append(roomElement)
//     roomContainer.append(roomLink)
// })

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`, 'members-message')
})

socket.on('user-connected', name => {
    appendMessage(`${name} connected.`, 'alert alert-success')
})

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected.`, 'alert alert-danger')
})

function appendMessage(message, divClass = '') {
    const messageElement = document.createElement('div')
    messageElement.innerText = message;
    divClass != '' ? messageElement.className = divClass : ''
    messageContainer.append(messageElement)
    messageContainer.scrollTop = messageContainer.scrollHeight
}
