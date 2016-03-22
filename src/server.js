"use strict";
const express = require('express');
const db = require("./db");

const app = express();


app.get('/', (req, res) => {
    res.sendfile("./index.html");
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});