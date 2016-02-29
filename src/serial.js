"use strict";
let serconf = {
    port: "/dev/ttyUSB1",
    baudrate: 115200
};

/* Importing the serialnode module */
const SerialPort = require("serialport").SerialPort;

/*Initializing a serialnode object with the parameters*/
let sp = new SerialPort(serconf.port, {
    baudrate: serconf.baudrate
});

sp.handleSerial = function (writeString, callback) {

    sp.write(writeString);

    /* Initiating a buffer that will hold the data that's being streamed from the binary buffer */
    let buffer = [];

    sp.on("data", (data)=> {

        /* Converting the binary data to string and adding it to the string buffer */
        buffer.push(data.toString("utf8"));

        /* If the message is over, return the buffer  */
        if (data.toString("utf8").match(">")) {
            /*clearInterval(enter_timeout);
             enter_timeout = setInterval(enterTimeout, 1000);*/
            //serialPort.removeAllListeners();
            let result = buffer.join('');
            callback(result);
        }
    });
};

module.exports = sp;