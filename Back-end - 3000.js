// const _ = require('lodash');
// import buses from './buses'
const express = require('express')
const buses = require('./buses')
const app = express()
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const fetch = require('node-fetch');
var coords =null;
var USERS = [
    { 'id': 1, 'username': 'a', 'password': '1', 'company': 'ka' },
    { 'id': 2, 'username': 'awaad', 'password': '123456', 'company': 'kb' },
    { 'id': 3, 'username': 'hussain', 'password': '123456', 'company': 'kc' },
    { 'id': 4, 'username': 'khater', 'password': '2', 'company': 'ka' },
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
// app.use(expressJwt({secret: 'app-super-shared-secret'}).unless({path: ['/api/auth']}));

app.get('/', function (req, res) {
    res.download('./mark.jpg')
});

app.get('/users', function (req, res) {

    res.send({ token: USERS });
});
app.get('/busesList', function (req, res) {
    console.log("buses list");

    res.send(buses);
});
app.get('/coords', function (req, res) {
    

    res.send(coords);
});
app.get('/userData', function (req, res) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        var decoded = jwt.verify(token, 'app-super-shared-secret');

        const user = USERS.find(user => user.id == decoded.userID);
        const userClone = {
            id: user.id, username: user.username, company: user.company
        }


        res.send({ user: userClone });
    }
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

buses.buses.map(element => {


    // console.log(element);
    const mode = 'driving'; // 'walking';
    const APIKEY = 'AIzaSyD7arViUQWyZhROPL4HKcujDdNy_fi2XW4';
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${element.origin}&destination=${element.destination}&key=${APIKEY}&mode=${mode}`;
    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            console.log(responseJson);

            if (responseJson.routes.length) {

                 coords = decode(responseJson.routes[0].overview_polyline.points) // definition below
                
                console.log(coords);

            }
        }).catch(e => { console.warn(e) });
   function decode(t, e){ for (var n, o, u = 0, l = 0, r = 0, d = [], h = 0, i = 0, a = null, c = Math.pow(10, e || 5); u < t.length;) { a = null, h = 0, i = 0; do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32); n = 1 & i ? ~(i >> 1) : i >> 1, h = i = 0; do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32); o = 1 & i ? ~(i >> 1) : i >> 1, l += n, r += o, d.push([l / c, r / c]) } return d = d.map(function (t) { return { latitude: t[0], longitude: t[1] } }) }


});




app.listen(3000, function () {
    console.log(' API Server listening on port 3000!')
});
