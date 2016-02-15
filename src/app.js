"use strict"
let serconf = {
    port: "/dev/ttyUSB3",
    baudrate: 115200
};

/* Importing the serialnode module */
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
var sleep = require('sleep');
var ifconfig_addr;

/* Importing state maschine */
let i = 0;
let leds =
    [   "fibroute \n",
        "sndpkt 2001:db8::2e00:2500:1257:3346 4 0 1 0 0 0 0 LED(red) 0 0\n",
        "sndpkt 2001:db8::2e00:2500:1257:3346 4 1 1 0 0 0 0 LED(green) 0 0\n",
        "sndpkt 2001:db8::2e00:2500:1257:3346 4 2 1 0 0 0 0 LED(orange) 0 0\n" ,
        "sndpkt 2001:db8::2e00:2500:1257:3346 4 0 0 0 0 0 0 LED(red) 0 0\n",
        "sndpkt 2001:db8::2e00:2500:1257:3346 4 1 0 0 0 0 0 LED(green) 0 0\n",
        "sndpkt 2001:db8::2e00:2500:1257:3346 4 2 0 0 0 0 0 LED(orange) 0 0\n" ,
        "sndpkt 2001:db8::1e00:3800:1357:3346 4 0 1 0 0 0 0 LED(red) 0 0\n",
        "sndpkt 2001:db8::1e00:3800:1357:3346 4 1 1 0 0 0 0 LED(green) 0 0\n",
        "sndpkt 2001:db8::1e00:3800:1357:3346 4 2 1 0 0 0 0 LED(orange) 0 0\n" ,
        "sndpkt 2001:db8::1e00:3800:1357:3346 4 0 0 0 0 0 0 LED(red) 0 0\n",
        "sndpkt 2001:db8::1e00:3800:1357:3346 4 1 0 0 0 0 0 LED(green) 0 0\n",
        "sndpkt 2001:db8::1e00:3800:1357:3346 4 2 0 0 0 0 0 LED(orange) 0 0\n" ];
let timeoutevent;


let sm = require("state-machine-js");
/*Initializing a serialnode object with the parameters*/
var sp = new SerialPort(serconf.port, {
    baudrate: serconf.baudrate
});
let cnt = 0;
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
        if (result.match(/inet6 addr: fe80::3600:3400:757:3156\/64  scope: local/)) {//TODO
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
        if (result.match(/Success: send 34 byte/)|| result.match(/Destination                             Flags        Next Hop/)){
            stateMachine.action(Action.TIMEOUT);
            buffer = [];
        }
        if (result.match(/msg         :/)){
            clearTimeout(timeoutevent);
            stateMachine.action(Action.TIMEOUT2);
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
    READY: 'READY',
    WRITELED: 'WRITELED'
};

var Action = {
    INITIATED: 'INITIATED',
    GOT_IPADDR: 'GOT_IPADDR',
    SETNETIF_RDY: 'SETNETIF_RDY',
    DODAG_RDY: 'DODAG_RDY',
    TIMEOUT: 'TIMEOUT',
    TIMEOUT2: 'TIMEOUT2'
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
    ,
    {
        name: State.READY,
        transitions: [
            { action: Action.TIMEOUT, target: State.WRITELED }
        ]
        ,
        onEnter: function(state,data,action){

            i++;
            i %= leds.length;
            sp.write(leds[i]);
        }
    }
    ,
    {
        name: State.WRITELED,
        transitions: [
            { action: Action.TIMEOUT2, target: State.READY }
        ]
        ,
        onEnter: function(state,data,action){
            timeoutevent = setTimeout(Timeout2, 300);
            console.log(i);
        }
    }
];
function Timeout(){stateMachine.action(Action.TIMEOUT);}
function Timeout2(){stateMachine.action(Action.TIMEOUT2);}
//setInterval(stateMachine.action(Action.TIMEOUT2), 1000);
// create multiple states with a config array
stateMachine.create(config);

// add listener for state change
stateMachine.onChange.add(function(state, data, action) {
    console.log('State has changed to:', state.name);
    console.log('Got data:', data);
    console.log('Got triggering action:', action);
});

