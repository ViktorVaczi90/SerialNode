let config = {
  port: "/dev/ttyACM1",
  baudrate: 115200
};

/*Importing the serialnode module*/
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

/*Initializing a serialnode object with the parameters*/
var sp = new SerialPort( config.port , {
    parser: serialport.parsers.readline("\n"),
    baudrate: config.baudrate
});

/*Opening the serialport*/
sp.open((err)=>{
    "use strict";
    if (err) console.log(err);
    else {
        console.log("Opened slot: ", config);
    }

    let address = new Promise( (resolve, reject) => {
        sp.write("ifconfig\n", function(err, results) {
            if (err) console.log('err ' + err);
            //console.log('results ' + results);
            sp.on('data', function(data) {
                //process.stdout.write(data.toString("utf8"));
                let arr = data.toString("utf8").split(/\n|\r\n/);
                arr = arr.map((item) => {
                    return item.trim()
                });
                let line = data.toString("utf8");
                let regexMatch = line.match(/(([a-zA-Z0-9]{4})::)([a-zA-Z0-9]{4}:){3}[a-zA-Z0-9]{4}/);
                if (regexMatch) {
                    let id = regexMatch[0];
                    console.log("The address of the device is: " ,id);
                    sp.close( (err)=>{
                        if (err) console.log(err);
                        else {
                            console.log("Recieved data, closing connection!");
                            resolve({ address: id });
                        }
                    })
                }
            });
        });
    }).then((hardwareAddr) => {

            sp.open((err)=> {
                if (err) console.log(err);
                else {
                    console.log("Opened slot: ", config);
                    let lenght = hardwareAddr.address.length;
                    hardwareAddr.id = hardwareAddr.address.substring(lenght - 2, lenght);
                    console.log("Hardware addr is: ", hardwareAddr.id);

                    let output = "ifconfig 7 set addr " + hardwareAddr.id+"\n";

                    sp.write(output, (err, res) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("response: " + res);
                            sp.on("data", function (data) {
                                let arr = data.toString("utf8").split(/\n|\r\n/);
                                arr = arr.map((item) => {
                                    return item.trim()
                                });
                                let line = data.toString("utf8");
                                console.log(line);
                            });
                        };
                    });
                }


            })



    })

});
