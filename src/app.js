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


let setup = new Promise((resolve, reject) => {

    /* Opening the serial port */
    sp.open((err)=> {
        if (err) console.log(err);
        else {
            console.log("Opened slot: ", config);
            sp.write("ifconfig\n", function (err, results) {
                if (err) console.log('err ' + err);
                sp.on('data', function (data) {
                    let line = data.toString("utf8");
                    let regexMatch = line.match(/(([a-zA-Z0-9]{4})::)([a-zA-Z0-9]{4}:){3}[a-zA-Z0-9]{4}/);
                    if (regexMatch) {
                        let id = regexMatch[0];
                        console.log("The address of the device is: ", id);
                        sp.close((err)=> {
                            if (err) console.log(err);
                            else {
                                console.log("Recieved data, closing connection!");
                                resolve({address: id});
                            }
                        })
                    }
                });
            });
        }
    })
}).then((hardwareAddr) => {

        /* Setting the hardware address */

        return new Promise((resolve, reject) => {
            sp.open((err)=> {
                if (err) console.log(err);
                else {
                    console.log("Opened slot: ", config);
                    let length = hardwareAddr.address.length;
                    hardwareAddr.id = hardwareAddr.address.substring(length - 2, length);
                    console.log("Hardware addr is set to ", hardwareAddr.id);

                    let output = "ifconfig 7 set addr " + hardwareAddr.id + "\n";

                    sp.write(output, (err, res) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            sp.on("data", function (data) {
                                let line = data.toString("utf8");

                                if (line.match(/success: set \(short\) address/)) {
                                    sp.close(() => {
                                        console.log(line);
                                        resolve(hardwareAddr);
                                    })
                                }
                            });
                        }
                    });
                }

            })
        });

    }).then((hardwareAddr) => {
        console.log(hardwareAddr)
    })
