"use strict";
/**
 * Created by v on 2016.02.29..
 */
const SerialHandler = require("./serial.js");

let serial = new SerialHandler();

serial.openConn().then(()=>{
        serial.handleSerial("reboot\n").then((data)=>{
        console.log(data)
    }).then(()=>{
        serial.closeConn();
    });
})
