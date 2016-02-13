let config = {
    port: "/dev/ttyACM1",
    baudrate: 115200
};

/*Importing the serialnode module*/
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

/*Initializing a serialnode object with the parameters*/
var sp = new SerialPort(config.port, {
    //parser: serialport.parsers.readline("\n"),
    baudrate: config.baudrate
});

/* Opening the serial port */
sp.open((err) => {
    if (err) console.log("Error initiating the connection");
    else {
        sp.write("ifconfig\n", (err, res) => {
            if (err) console.log(err);
            else {
                let buffer = [];
                sp.on("data", (data)=> {
                    buffer.push(data.toString("utf8"));
                    if (data.toString("utf8").match(">")) {
                        sp.removeAllListeners();
                        console.log(buffer.join(' '));
                    }
                })
            }
        })
    }
});


//let getHardwareAddress = function (serialPort) {
//
//    let id = null;
//    let logged = false;
//    let received = [];
//
//    return new Promise((resolve, reject) => {
//        sp.write("ifconfig\n", function (err, results) {
//            if (err) console.log('err ' + err);
//            sp.on('data', function (data) {
//                let line = data.toString("utf8");
//                received.push(line);
//                let regexMatch = line.match(/(([a-zA-Z0-9]{4})::)([a-zA-Z0-9]{4}:){3}[a-zA-Z0-9]{4}/);
//                if (regexMatch != null && id == null && logged == false) {
//                    id = regexMatch[0];
//                    console.log("The address of the device is: ", id);
//                    logged = true;
//                } else if (id != null && line.match(/>/) != null) {
//                    serialPort.removeAllListeners();
//                    resolve(id);
//                }
//            });
//        });
//    })
//};
//
//let sendCommand = function (serialPort, command, until) {
//
//    let matched = false;
//
//    return new Promise((resolve, reject) => {
//        serialPort.write(command, (err, results) => {
//            if (err) reject(err);
//            else {
//                serialPort.on('data', (data) => {
//                    let line = data.toString("utf8").trim();
//
//                    if (matched == false && line.match(until) != null) {
//                        console.log(line);
//                        matched = true;
//                    }
//                    /* When the message is finished remove the event listener */
//                    else if (matched == true && line.match(/>/)) {
//                        serialPort.removeAllListeners();
//                        resolve(true);
//                    }
//                })
//            }
//        })
//    })
//};


//-------------------

///**
// * This function reads a complete message from the serial port.
// * @param {Object} serialPort - An opened serialport-2 object
// * @returns {*|Promise|P} An array of strings that holds the data read from the buffer.
// */
//let readFromSerial = function (serialPort) {
//    return new Promise((resolve, reject) => {
//
//        let buffer = [];
//
//        serialPort.on("data", (data)=> {
//            buffer.push(data.toString("utf8"));
//            if (data.toString("utf8").match(">")) {
//                serialPort.removeAllListeners();
//                resolve(buffer)
//            }
//        })
//    })
//};
//
///**
// * A callback that handles the array of lines that was created from the stream buffer.
// * @callback writeToSerialCallback
// * @param {*|Promise|P} data - An array of strings that holds the data read from the buffer.
// */
//
///**
// * This function writes to the serialport and waits for the result.
// * @param {Object} serialPort - An opened serialport-2 object
// * @param {string} command - Serial command
// * @param {writeToSerialCallback} success - A callback that handles the response came from the serial
// */
//let writeToSerial = function (serialPort, command, success) {
//    serialPort.write(command, (err, res) => {
//        if (err) console.log(err);
//        else success(readFromSerial(serialPort))
//    })
//};

