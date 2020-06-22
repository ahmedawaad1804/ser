// const _ = require('lodash');
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

var USERS = [
    { 'id': 1, 'username': 'a', 'password': '1' ,'company':'ka'},
    { 'id': 2, 'username': 'awaad', 'password': '123456','company':'kb' },
    { 'id': 3, 'username': 'hussain', 'password': '123456' ,'company':'kc'},
    { 'id': 4, 'username': 'khater', 'password': '2' ,'company':'ka'},
];

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*'); //<-- you can change this with a specific url like http://localhost:4200
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
app.use(bodyParser.json());
// app.use( function (req, res) {
//     console.log(req.headers.authorization);
    
// });
app.use(expressJwt({secret: 'app-super-shared-secret'}).unless({path: ['/api/auth']}));

app.get('/', function (req, res) {
    res.download('./mark.jpg')
});

app.get('/users', function (req, res) {

    res.send({ token: USERS });
});
app.get('/userData', function (req, res) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
    var decoded = jwt.verify(token, 'app-super-shared-secret');
    
    const user = USERS.find(user => user.id == decoded.userID);
    const userClone= {
        id:user.id,username:user.username,company:user.company
    }
       

    res.send({ user:userClone});}
    else {
        res.sendStatus(401);
    }
});
app.post('/api/auth', function (req, res) {
    const body = req.body;

    const user = USERS.find(user => user.username == body.username);
    console.log(user);
    
    if (!user || body.password != user.password) return res.sendStatus(401);

    var token = jwt.sign({ userID: user.id }, 'app-super-shared-secret', { expiresIn: '2h' });
    console.log(token);
    
    res.send({ token });
});


app.listen(4000, function () {
    console.log(' API Server listening on port 4000!')
});
