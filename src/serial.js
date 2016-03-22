"use strict";
let serconf = {
    port: "/dev/ttyUSB0",
    baudrate: 115200
};

/* Importing the serialnode module */
const SerialPort = require("serialport").SerialPort;

class Sp {
    constructor () {
        let sp = new SerialPort(serconf.port, {
            baudrate: serconf.baudrate
        });

        this.sp = sp;


    }

    openConn () {
        return new Promise((resolve, reject)=>{
            this.sp.open((err)=>{
                if (err) reject(err);
                else {
                    console.log("Serial connection initiated!");
                    resolve(true)
                }
            });
        })
    }

    handleSerial(command) {
        let prom = new Promise((resolve,reject)=>{
            this.sp.write(command, (err, res) => {

                let buffer = [];

                this.sp.on("data", (data)=> {
                    /* Converting the binary data to string and adding it to the string buffer */
                    buffer.push(data.toString("utf8"));

                    /* If the message is over, return the buffer  */
                    if (data.toString("utf8").match(">")) {resolve(buffer);}
                })
            })
        });

        return prom.then((asd)=>{
            let result = asd.join('');
            return result;
        });

    }

    closeConn(){
        this.sp.close((err)=>{
            if (err) console.log(err);
            else {
                console.log("Disconnect successful");
            }
        })
    }
}

module.exports = Sp;