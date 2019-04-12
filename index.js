const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const loki = require('lokijs')


const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)


let userCollection;

const db = new loki("users.json",{
    autoload: true,
    autoloadCallback: function(){
        userCollection = db.getCollection("users")
        if(userCollection === null) userCollection = db.addCollection("users")
    },
    autosave: true,
    autosaveInterval: 3000
});

io.on('connection',(socket) =>{
    let users = userCollection.chain().data()
    socket.emit('users-list',users)

    socket.on('user-create',(userData) =>{
        let user = {
        name: userData.name || '',
        lastname: userData.lastname || '',
        email: ((userData.email) ? userData.email : ''),
        birthdate: userData.birthdate || ''
    }
    userCollection.insert(user)
    let users = userCollection.chain().data()
    socket.emit('users-list',users)
    })
})

app.set('appName','App de usuarios')
const port = proccess.env.PORT || 8080;
app.set('view engine','ejs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded( {extended: true} ))
app.use(morgan('combined'))

/*app.get('/',(request,response) =>{
    let users = userCollection.chain().data()
    response.render('index.ejs',{
        users
    })
})*/

app.get('/users',(request,response) => {
    let users = userCollection.chain().data()
    response.send(users)
})

app.get('/users/:id',(request,response) => {
    let userId = request.params.id
    let user = userCollection.get(userId)
    response.send(user)
})

app.put('/users',(request,response) => {
    let body = request.body
    let user = {
        name: body.name || '',
        lastname: body.lastname || '',
        email: ((body.email) ? body.email : ''),
        birthdate: body.birthdate || ''
    }
    userCollection.insert(user)
    response.send(user)
})

app.delete('/users/:id',(request,response) => {
    let userId = request.params.id
    let user = userCollection.get(userId)
    user && userCollection.remove(user)
    response.send(user)
})

//app.use(express.static('public'))

server.listen(port, () => {
    console.log('Server running',app.get('appName'))
})
