"use strict";

var config = {
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

/*Opening the serialport*/
sp.open(function (err) {
    "use strict";
    if (err) console.log(err);else {
        console.log("Opened slot: ", config);
    }

    var address = new Promise(function (resolve, reject) {
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
                var regexMatch = line.match(/(([a-zA-Z0-9]{4})::)([a-zA-Z0-9]{4}:){3}[a-zA-Z0-9]{4}/);
                if (regexMatch) {
                    (function () {
                        var id = regexMatch[0];
                        console.log("The address of the device is: ", id);
                        sp.close(function (err) {
                            if (err) console.log(err);else {
                                console.log("Recieved data, closing connection!");
                                resolve({ address: id });
                            }
                        });
                    })();
                }
            });
        });
    }).then(function (hardwareAddr) {

        sp.open(function (err) {
            if (err) console.log(err);else {
                console.log("Opened slot: ", config);
                var lenght = hardwareAddr.address.length;
                hardwareAddr.id = hardwareAddr.address.substring(lenght - 2, lenght);
                console.log("Hardware addr is: ", hardwareAddr.id);

                var output = "ifconfig 7 set addr " + hardwareAddr.id + "\n";

                sp.write(output, function (err, res) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("response: " + res);
                        sp.on("data", function (data) {
                            var arr = data.toString("utf8").split(/\n|\r\n/);
                            arr = arr.map(function (item) {
                                return item.trim();
                            });
                            var line = data.toString("utf8");
                            console.log(line);
                        });
                    };
                });
            }
        });
    });
});