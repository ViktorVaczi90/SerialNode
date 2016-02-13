let config = {
    port: "/dev/ttyACM1",
    baudrate: 115200
};

/* Importing the serialnode module */
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

/*Initializing a serialnode object with the parameters*/
var sp = new SerialPort(config.port, {
    baudrate: config.baudrate
});

/* Opening the serial port */
sp.open((err) => {
    if (err) console.log("Error initiating the connection");
    else {

        /* Starting the root configuration */

        sendCommand(sp, "ifconfig").then((data)=>{
            return data;
        }).then( (data) => {

            /* Extracting the hardware address from the inet6 address */

            for (let item of data){
                let match = item.match(/(([a-zA-Z0-9]{4})::)([a-zA-Z0-9]{4}:){3}[a-zA-Z0-9]{4}/);
                if (match != null) {
                    // the last 2 numbers of the address is the hardware address
                    return match[0].slice(-2);
                }
            }

        }).then( (hardwareAddress) => {

            /* Setting the hardware address to the correct value */

            return sendCommand(sp, "ifconfig 7 set addr " + hardwareAddress);

        }).then(()=>{

            /* Setting the rpl root adress */

            return sendCommand(sp, "ifconfig 7 add 2001:db8::1");

        }).then(() => {

            /* Initiating the rpl */

            let rplInitiated = false;

            while (rplInitiated == false) {
                setTimeout(()=>{
                    sendCommand(sp,)
                }, 1000)
            }
        }).then( (data) => {

            /* Configuration completed closing the connection */
            sp.close( () => {
                console.log("Connection closed!")
            })
        })
    }
});

let sendCommand = function (serialPort, command) {

    // adding a \n to the end of the command
    if (command.endsWith('\n')  == false) command = command + "\n";

    return new Promise( (resolve, reject) => {
        serialPort.write(command, (err, res) => {
            if (err) console.log(err);
            else {
                let buffer = [];
                serialPort.on("data", (data)=> {
                    buffer.push(data.toString("utf8"));
                    if (data.toString("utf8").match(">")) {
                        serialPort.removeAllListeners();
                        let result = buffer.join(' ')
                        console.log(result);
                        resolve(result.split('\n').map((item)=>{ return item.trim() }));
                    }
                })
            }
        })
    });
};


