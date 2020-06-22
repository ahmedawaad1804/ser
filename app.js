const _ = require('lodash');
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
var server = app.listen(5000, () => {
    console.log("Listening ..");
  });
let io = require('socket.io').listen(server);
// let io = socketIO(server);

// app.use(express.static(__dirname + '/dist'));
let timerId = null,
    sockets = new Set();
var tradedata = require('./data');
var USERS = [
    { 'id': 1, 'username': 'ahmed'       ,'password': '123456' },
    { 'id': 2, 'username': 'ahmad'       ,'password': '123456' },
    { 'id': 3, 'username': 'hussain'     ,'password': '123456' },
];
var current=new Date(Date.now())
var s=current.toLocaleDateString()
console.log(s);

var arr=[
        {noti:'system updated',read:true,status:'severe',position:{long:-71.6730576392892,lat:41.350765777153136},date:s},
        {noti:'system rejected',read:true,status:'med',position:{long:-71.9730576392892,lat:41.950765777153136},date:s},
        {noti:'system restarted',read:true,status:'high',position:{long:14,lat:8},date:s},
        ]
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200"); //<-- you can change this with a specific url like http://localhost:4200
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
  });
app.use(bodyParser.json());
// app.use(expressJwt({secret: 'app-super-shared-secret'}).unless({path: ['/api/auth']}));
io.on('connection', (socket) => {
    console.log('user connected');
    socket.emit('new-message', arr);

    // socket.on('new-message', (message) => {
    //   console.log(message);
    // });
});
app.get('/', function (req, res) {
    res.send('hello !!')
});
app.post('/log', function (req, res) {
    res.send('hello !!')
});
app.post('/api/auth', function(req, res) {
    const body = req.body;

    const user = USERS.find(user => user.username == body.username);
    if(!user || body.password != user.password ) return res.sendStatus(401);
    
    var token = jwt.sign({userID: user.id}, 'app-super-shared-secret', {expiresIn: '2h'});
    res.send({token});
});


app.listen(4000, function () {
    console.log(' API Server listening on port 4000!')
});
app.get('/new', function (req, res) {
    console.log(req.query.noti);
    arr.push({noti:req.query.noti,read:true,status:'high',position:{long:14,lat:8},date:Date.now()})
    io.emit('new-notification', arr);
    console.log(arr);
     res.send('notification recieved')
    
});
app.get('/allread', function (req, res) {
    
    arr.forEach(element => {
        element.read=false
    });
    
    
     res.send('notification zeroed')
    
});