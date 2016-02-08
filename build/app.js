"use strict";

var config = {
    port: "/dev/ttyACM1",
    baudrate: 115200
};

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var sp = new SerialPort(config.port, {
    parser: serialport.parsers.readline("\n"),
    baudrate: config.baudrate
});

sp.open(function (err) {
    "use strict";
    if (err) console.log(err);else {
        console.log("Opened slot: ", config);
    }
    sp.write("ifconfig\n", function (err, results) {
        if (err) console.log('err ' + err);
        //console.log('results ' + results);
        sp.on('data', function (data) {
            //process.stdout.write(data.toString("utf8"));
            var arr = data.toString("utf8").split(/\n|\r\n/);
            arr = arr.map(function (item) {
                return item.trim();
            });
            var line = data.toString("utf8");
            if (line.match(/(([a-zA-Z0-9]{4})::)([a-zA-Z0-9]{4}:){3}[a-zA-Z0-9]{4}/)) {
                var id = line.match(/(([a-zA-Z0-9]{4})::)([a-zA-Z0-9]{4}:){3}[a-zA-Z0-9]{4}/)[0];
                console.log(id);
            }
        });
    });
});

//var SerialPort = require("serialport").SerialPort;
//var serialPort = new SerialPort(config.port, {
//    baudrate: config.baudrate
//}, false); // this is the openImmediately flag [default is true]

//serialPort.open(function (error) {
//    if ( error ) {
//        console.log('failed to open: '+error);
//    } else {
//        console.log('The serial port is open:', config);
//        serialPort.write("ifconfig\n", function(err, results) {
//            if (err) console.log('err ' + err);
//            //console.log('results ' + results);
//            serialPort.on('data', function(data) {
//                //process.stdout.write(data.toString("utf8"));
//                let arr = data.toString("utf8").split(/\n|\r\n/);
//                arr = arr.map((item) => {
//                    return item.trim()
//                });
//                console.log(arr);
//            });
//        });
//    }
//});