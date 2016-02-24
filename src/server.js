"use strict";
const express = require('express');
const db = require("./db");

const app = express();


db.getDifference(["UaJiYFwCNH3xN8eW", "Ww6wuEQ2S0wTlj2c"]).then((response)=>{
    console.log(response)
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});