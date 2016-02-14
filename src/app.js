"use strict"
let serconf = {
    port: "/dev/ttyUSB2",
    baudrate: 115200
};

/* Importing the serialnode module */
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var ifconfig_addr;

/* Importing state maschine */

let sm = require("state-machine-js");
/*Initializing a serialnode object with the parameters*/
var sp = new SerialPort(serconf.port, {
    baudrate: serconf.baudrate
});
/* Initiating a buffer that will hold the data that's being streamed from the binary buffer */
let buffer = [];
/* Listening for the data event, and reading from the binary buffer
 and filling up the string buffer until the end of the message */
sp.on("data", (data)=> {

    /* Converting the binary data to string and adding it to the string buffer */
    buffer.push(data.toString("utf8"));

    /* If the message is over, return the buffer  */
    if (data.toString("utf8").match(">")) {
        //serialPort.removeAllListeners();
        let result = buffer.join('');
        console.log(result);
        if (result.match(/All up, running the shell now/)) {
            stateMachine.action(Action.INITIATED);
            buffer = [];
        }
        if (result.match(/inet6 addr: fe80::2e00:2500:1257:3346\/64  scope: local/)) {//TODO
            ifconfig_addr = "fe80::2e00:2500:1257:3346";
            stateMachine.action(Action.GOT_IPADDR);
            buffer = [];
        }
        if (result.match(/success: added fe80::01\/64 to interface 7/)){
            stateMachine.action(Action.SETNETIF_RDY);
            buffer = [];
        }
        if (result.match(/successfully added a new RPL DODAG/)){
            stateMachine.action(Action.DODAG_RDY);
            buffer = [];
        }

    }
});

sp.open( () => {
    // start
    stateMachine.start();
});
var stateMachine = new sm();

var State = {
    INTIAL: 'INTIAL',
    REBOOT: 'REBOOT',
    GETNETIF: 'GETNETIF',
    SETNETIF: 'SETNETIF',
    SETNETIF2: 'SETNETIF2',
    READY: 'READY'
};

var Action = {
    INITIATED: 'INITIATED',
    GOT_IPADDR: 'GOT_IPADDR',
    SETNETIF_RDY: 'SETNETIF_RDY',
    DODAG_RDY: 'DODAG_RDY'
};
var config = [
    {
        initial: true,
        name: State.INTIAL,
        transitions: [
            { action: Action.INITIATED, target: State.GETNETIF }
        ],
        onEnter: function(state,data,action){
            sp.write("reboot\n");
        }
    },
    {
        name: State.REBOOT,
        transitions: [
            { action: Action.INITIATED, target: State.GETNETIF }
        ],
        onEnter: function(state,data,action){
            sp.write("reboot\n");
        }
    },
    {
        name: State.GETNETIF,
        transitions: [
            { action: Action.GOT_IPADDR, target: State.SETNETIF }
        ],
        onEnter: function(state,data,action){
            sp.write("ifconfig\n");
        }
    },
    {
        name: State.SETNETIF,
        transitions: [
            { action: Action.SETNETIF_RDY, target: State.SETNETIF2 }
        ]
        ,
        onEnter: function(state,data,action){
            sp.write("ifconfig 7 del "+ifconfig_addr + "\n" +
            "ifconfig 7 set addr 01\n"+
            "ifconfig 7 add fe80::01\n");

        }
    },
    {
        name: State.SETNETIF2,
        transitions: [
            { action: Action.DODAG_RDY, target: State.READY }
        ]
        ,
        onEnter: function(state,data,action){
            sp.write("ifconfig 7 add 2001:db8::1\n"+
            "rpl init 7\n"+
            "rpl root 1 2001:db8::1\n");
        }
    }
];

// create multiple states with a config array
stateMachine.create(config);

// add listener for state change
stateMachine.onChange.add(function(state, data, action) {
    console.log('State has changed to:', state.name);
    console.log('Got data:', data);
    console.log('Got triggering action:', action);
});

