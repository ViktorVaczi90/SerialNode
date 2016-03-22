"use strict";
const express = require('express');
const db = require("./db");

const app = express();
const appDatas = require('./app.js');
let datas = new appDatas;

app.get('/', (req, res) => {
    res.sendfile("./index.html");
});
app.get('/leds',(req,res) => {
    res.send(datas.getData());
})
app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});