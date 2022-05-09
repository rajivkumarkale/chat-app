const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message-text')
const $messageFormButton = $messageForm.querySelector('button')
const $locationSendButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//template elements
const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})


const autoscroll = () =>{
    //new message element
    const $newMessage = $messages.lastElementChild

    //get the height of the newMessage
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    // how far have  i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight - scrollOffset <=1){
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on("message", (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})


socket.on('locationMessage', (message)=>{
    //console.log(message)
    const html = Mustache.render(urlTemplate, {
        username: message.username,
        url :message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})


socket.on('roomData', ({room, users})=>{
    console.log(room, users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})


$locationSendButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Your browser doesn\'t supportdd Geolocation')
    }

    $locationSendButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position.coords);
        socket.emit('sendLocation', {'latitude': position.coords.latitude, 'longitude' : position.coords.longitude}, ()=>{
            console.log('Location shared!')
        })
        $locationSendButton.removeAttribute('disabled')
    })
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    socket.emit('sendMessage', $messageFormInput.value, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Delivered')
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

