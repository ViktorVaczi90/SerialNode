"use strict";
const express = require('express');
const db = require("./db");


const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//const appDatas = require('./app.js');
//let datas = new appDatas;

app.get('/', (req, res) => {
    res.sendFile("index.html", {"root": __dirname});
});

//app.get('/leds',(req,res) => {
//    res.send(datas.getData());
//})

let i = 1;
app.post('/leds', (req, res) => {
    console.log("POST", "/leds", ++i, req.body);
    console.log();
    res.statusCode = 200;
    res.send()
});

app.listen(3000, () => {
    console.log('SerialNode server is listening on port 3000!');
});