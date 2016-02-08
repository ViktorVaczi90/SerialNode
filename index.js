var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyUSB2", {
    baudrate: 115200
}, false); // this is the openImmediately flag [default is true] 

serialPort.open(function (error) {
    if ( error ) {
        console.log('failed to open: '+error);
    } else {
        console.log('open');
        serialPort.on('data', function(data) {
            process.stdout.write(data);
        });
        serialPort.write("help\n", function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    }
});