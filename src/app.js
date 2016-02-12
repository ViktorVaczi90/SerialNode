let config = {
    port: "/dev/ttyACM1",
    baudrate: 115200
};

/*Importing the serialnode module*/
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

/*Initializing a serialnode object with the parameters*/
var sp = new SerialPort(config.port, {
    parser: serialport.parsers.readline("\n"),
    baudrate: config.baudrate
});

/* Opening the serial port */
sp.open((err) => {
    if (err) console.log("Error initiating the connection");
    else {
        getHardwareAddress(sp).then( (hardwareAddress) => {
            let command = "ifconfig 7 set addr "+hardwareAddress+"\n";
            return sendCommand(sp, command, /success: set \(short\) address/)
        })
    }
});

let getHardwareAddress = function (serialPort) {

    let id = null;
    let logged = false;
    let received = [];

    return new Promise((resolve, reject) => {
        sp.write("ifconfig\n", function (err, results) {
            if (err) console.log('err ' + err);
            sp.on('data', function (data) {
                let line = data.toString("utf8");
                received.push(line);
                let regexMatch = line.match(/(([a-zA-Z0-9]{4})::)([a-zA-Z0-9]{4}:){3}[a-zA-Z0-9]{4}/);
                if (regexMatch != null && id == null && logged == false) {
                    id = regexMatch[0];
                    console.log("The address of the device is: ", id);
                    logged = true;
                } else if (id != null && line.match(/>/) != null) {
                    serialPort.removeAllListeners();
                    resolve(id);
                }
            });
        });
    })
};

let sendCommand = function (serialPort, command, until) {

    let matched = false;

    return new Promise((resolve, reject) => {
        serialPort.write(command, (err, results) => {
            if (err) reject(err);
            else {
                serialPort.on('data', (data) => {
                    let line = data.toString("utf8").trim();

                    if (matched == false && line.match(until) != null) {
                        console.log(line);
                        matched = true;
                    }
                    /* When the message is finished remove the event listener */
                    else if (matched == True && line.match(/>/)) {
                        serialPort.removeAllListeners();
                        resolve(true);
                    }
                })
            }
        })
    })
};

///* Setting up the root node*/
//
//let setup = new Promise((resolve, reject) => {
//
//    /* Getting the hardware address */
//
//    sp.open((err)=> {
//        if (err) console.log(err);
//        else {
//            console.log("Opened slot: ", config);
//            sp.write("ifconfig\n", function (err, results) {
//                if (err) console.log('err ' + err);
//                sp.on('data', function (data) {
//                    let line = data.toString("utf8");
//                    let regexMatch = line.match(/(([a-zA-Z0-9]{4})::)([a-zA-Z0-9]{4}:){3}[a-zA-Z0-9]{4}/);
//                    if (regexMatch) {
//                        let id = regexMatch[0];
//                        console.log("The address of the device is: ", id);
//                        if (err) console.log(err);
//                        else {
//                            sp.removeAllListeners();
//                            console.log("Recieved data, closing connection!");
//                            resolve({address: id});
//                        }
//                    }
//                });
//            });
//        }
//    })
//}).then((hardwareAddr) => {
//
//    /* Setting the new hardware address */
//
//    return new Promise((resolve, reject) => {
//        sp.open((err)=> {
//            if (err) console.log(err);
//            else {
//                console.log("Opened slot: ", config);
//                let length = hardwareAddr.address.length;
//                hardwareAddr.id = hardwareAddr.address.substring(length - 2, length);
//                console.log("Hardware addr is set to ", hardwareAddr.id);
//
//                let output = "ifconfig 7 set addr " + hardwareAddr.id + "\n";
//
//                sp.write(output, (err, res) => {
//                    if (err) {
//                        console.log(err);
//                    }
//                    else {
//                        sp.on("data", function (data) {
//                            let line = data.toString("utf8");
//
//                            if (line.match(/success: set \(short\) address/)) {
//                                sp.close(() => {
//                                    console.log(line);
//                                    resolve(hardwareAddr);
//                                })
//                            }
//                        });
//                    }
//                });
//            }
//
//        })
//    });
//
//}).then((hardwareAddr) => {
//
//    /* Setting the rpl root address */
//
//    return new Promise( (resolve, reject) => {
//        sp.open((err)=> {
//            if (err) console.log(err);
//            else {
//                console.log("Opened slot: ", config);
//
//                let output = "ifconfig 7 add 2001:db8::1\n";
//
//                sp.write(output, (err, res) => {
//                    if (err) {
//                        console.log(err);
//                    }
//                    else {
//                        sp.on("data", function (data) {
//                            let line = data.toString("utf8");
//
//                            //TODO: the root node's address is hard coded now
//                            if (line.match(/success: added/)) {
//                                sp.close( () => {
//                                    console.log(line.trim());
//                                    hardwareAddr.rootAddress = "2001:db8::1";
//                                    resolve(hardwareAddr);
//                                })
//                            }
//
//                        });
//                    }
//                });
//            }
//
//        })
//    })
//});