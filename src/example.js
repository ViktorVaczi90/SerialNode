"use strict";
/**
 * Created by v on 2016.02.29..
 */
const SerialHandler = require("./serial.js");

let prom = new Promise((res, rej)=>{
    let serial = new SerialHandler();
    serial.sp.open((err)=>{
        res(serial)
    });
});

prom.then( (serial) =>{
        serial.handleSerial("reboot\n").then((data)=>{
            console.log(data)
        }).then(()=>{
            serial.closeConn();
        });
}
);