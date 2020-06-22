const _ = require('lodash');
var json2xls = require('json2xls');
const { Parser } = require('json2csv');
const express = require('express')
const fs = require('fs');
const app = express()
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
var USERS =require('./clients.json')

var cors = require('cors')
const {
    Client
} = require('pg')
var limit=100000
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'thingsboard',
    password: '123456',
    port: 5432,
})
client.connect()

app.use(cors())
app.options('*', cors())

app.use(bodyParser.json());
app.use(expressJwt({secret: 'app-super-shared-secret-najmaps'}).unless({path: ['/api/auth']}));
app.get('/a', function (req, res) {

console.log(req);
res.download('./clients.json')
// res.send("saaaaaw")
})
app.get('/', function (req, res) {
    
    var arr = []
    var mydata  
    client.query('SELECT * FROM ts_kv ', (err, result) => {
        // console.log(err ? err.stack : res.rows[0].message) // Hello World!
        if (err) throw err

        var i = 0
        for (let index = 0; index < result.rows.length && index<limit; index++)
             {
                 element=result.rows[index]
            i++;
            var obj = {
                tss: "",
                key: "",
                value: ""
            };
            mydata = element.long_v
            if (!element.long_v) {
                mydata = element.dbl_v
            }
            var theDate = new Date(element.ts * 1);
            dateString = theDate.toISOString()

            obj.tss = dateString;
            obj.value = mydata;
            obj.key = element.key;
            // if(date)
            arr.push(obj)
            // prevDate=dateString
            // if(i>4000){break;}  // cant use break or return
        }
        
      var timestamp =Date.now()  
        console.log(i+" date "+timestamp     );
        const json2csvParser = new Parser();

const csv = json2csvParser.parse(arr);
console.log("parsed"   );
        // var xls = json2xls(arr,{
        //     fields: {tss:'string',key:'string',value:'number'}
        // });
        fs.writeFile('data' + timestamp + '.csv', csv, 'utf8', function (err) {
            console.log("written"   );

            res.download('./data' + timestamp + '.csv','data.csv', function (err) {
                if (err) {
                    console.log(err);
                    fs.unlink('./data' + timestamp  + '.csv', function (err) {
                        console.log("file deleted");
                    })
                } else {
                    console.log("downloaded"   );

                    fs.unlink('./data' + timestamp  + '.csv', function (err) {
                        console.log("file deleted");
                    })
                }
            })

        })
    })
});
app.post('/api/auth', function (req, res) {
    const body = req.body;
    const user = USERS.find(user => user.username == body.username);
    if (!user || body.password != user.password) return res.sendStatus(401);

    var token = jwt.sign({
        userID: user.id
    }, 'app-super-shared-secret-najmaps', {
        expiresIn: '2h'
    });
    console.log(token.userID);
    
    res.send({
        token
    });
});
app.get('/addFunds', (req, res) => {
    res.json({
        Customer_ID: 1507843123970,
        Bank_Account_Number: 7885236985412589,
      
    });
 });
 app.get('/userData', (req, res) => {
     console.log(req.user.userID);
     const user = USERS.find(user => user.id == req.user.userID);
     console.log(user);
     
    res.json(user);
 });
function log(obj){

}

app.listen(4000, function () {
    console.log(' API Server listening on port 4000!')
});