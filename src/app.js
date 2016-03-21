"use strict";
var ifconfig_addr;
var device1 = 0;
var device2 = 0;
var LED_RED1 = 0;
var LED_RED2 = 0;
var LED_GREEN1 = 0;
var LED_GREEN2 = 0;
var LED_ORANGE1 = 0;
var LED_ORANGE2 = 0;

const SerialHandler = require("./serial.js");
let serial = new SerialHandler();
let HandleSerial = serial.handleSerial;
const db = require("./db.js");
let buildstring = "SETUP";//"SERVER";//"SETUP"
/* Importing state maschine */
let i = 0;
let date = new Date();
let curr_node = {
    address: "",
    error: false,
    newDeviceRequest: true,
    devices: [
    ]
}
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

let cnt = 0;
let pkt_cnt = 0;
let device_cnt = 0;
/* Listening for the data event, and reading from the binary buffer
 and filling up the string buffer until the end of the message */

/*Variables for the database and state machine: */
let list_of_nodes = [];
var State = {
    INTIAL: 'INTIAL',
    REBOOT: 'REBOOT',
    GETNETIF: 'GETNETIF',
    SETNETIF: 'SETNETIF',
    SETNETIF2: 'SETNETIF2',
    SETNETIF3: 'SETNETIF3',
    SETNETIF4: 'SETNETIF4',
    SETNETIF5: 'SETNETIF5',
    SETNETIF6: 'SETNETIF6',

    NEW_FIBROUTE: 'NEW_FIBROUTE',
    GET_SENSACT_LIST: 'GET_SENSACT_LIST',
    SENSACT_LIST_ITEM: 'SENSACT_LIST_ITEM',
    SENSACT_LIST_ITEM_2: 'SENSACT_LIST_ITEM_2',

    GET_NODES: 'GET_NODES',
    GET_DEVS: 'GET_DEVS',
    GET_DEV: 'GET_DEV',
    GET_DEV_2: 'GET_DEV_2',

    SET_NODES: 'SET_NODES',
    SET_DEVS: 'SET_DEVS',
    SET_DEV: 'SET_DEV',
    SET_DEV_2: 'SET_DEV_2',

    READY: 'READY',
    WRITELED: 'WRITELED'
};

var Action = {
    INITIATED: 'INITIATED',
    GOT_IPADDR: 'GOT_IPADDR',
    SETNETIF_RDY: 'SETNETIF_RDY',
    DODAG_RDY: 'DODAG_RDY',
    NEW_FIB_ITEM: 'NEW_FIB_ITEM',
    NO_NEW_FIB_ITEM: 'NO_NEW_FIB_ITEM',

    FIB_RDY: 'FIB_RDY',
    FIB_NOT_RDY: 'FIB_NOT_RDY',
    DEV_NOT_RDY: 'DEV_NOT_RDY',

    SENSACT_LIST_CNT: 'SENSACT_LIST_CNT',
    SENSACT_LIST_ITEM: 'SENSACT_LIST_ITEM',
    SENSACT_LIST_ACK: 'SENSACT_LIST_ACK',
    SENSACT_ACK: 'SENSACT_ACK',

    SENSACT_LIST_ITEM_STEP: 'SENSACT_LIST_ITEM_STEP',

    DEV_STEP: 'DEV_STEP',

    GET_DEVICES: 'GET_DEVICES',
    GET_DEVLIST_RDY: 'GET_DEVLIST_RDY',
    GET_DEVS_NOT_RDY: 'GET_DEVS_NOT_RDY',
    GET_NOT_RDY: 'GET_NOT_RDY',
    GET_RDY: 'GET_RDY',

    SET_DEVICES: 'SET_DEVICES',
    SET_DEVLIST_RDY: 'SET_DEVLIST_RDY',
    SET_DEVS_NOT_RDY: 'SET_DEVS_NOT_RDY',
    SET_NOT_RDY: 'SET_NOT_RDY',
    SET_RDY: 'SET_RDY',

    TIMEOUT: 'TIMEOUT',//temporary states for setting up the device only
    TIMEOUT2: 'TIMEOUT2'
};

var config = [
    {
        initial: (buildstring=="SETUP"),
        name: State.INTIAL,
        transitions: [
            { action: Action.INITIATED, target: State.GETNETIF }
        ],
        onEnter: function(state,data,action) {
            serial.handleSerial("reboot\n").then((resultString)=> {
                if (resultString.match(/All up, running the shell now/)) {
                    stateMachine.action(Action.INITIATED);
                }
            })
        }
    },
    {
        name: State.GETNETIF,
        transitions: [
            { action: Action.GOT_IPADDR, target: State.SETNETIF }
        ],
        onEnter: function(state,data,action){
            serial.handleSerial("ifconfig\n").then((resultString)=> {
                if (resultString.match(/inet6 addr: fe80::2e00:2500:1257:3346\/64  scope: local/)) {//TODO
                    ifconfig_addr = "fe80::2e00:2500:1257:3346";
                    stateMachine.action(Action.GOT_IPADDR);
                }
            })
        }
    },
    /*
     "ifconfig 7 del "+ifconfig_addr + "\n" +
     "ifconfig 7 set addr 01\n"+
     "ifconfig 7 add fe80::01\n"
     "ifconfig 7 add 2001:db8::1\n"+
     "rpl init 7\n"+
     "rpl root 1 2001:db8::1\n"
    * */
    {
        name: State.SETNETIF,
        transitions: [
            { action: Action.SETNETIF_RDY, target: State.SETNETIF2 }
        ]
        ,
        onEnter: function(state,data,action){
            serial.handleSerial("ifconfig 7 del "+ifconfig_addr + "\n").then((resultString)=>{
                //console.log(resultString)
                if(resultString.match(/to interface 7/)){
                    stateMachine.action(Action.SETNETIF_RDY);
                }
            })
        }
    },
    {
        name: State.SETNETIF2,
        transitions: [
            { action: Action.SETNETIF_RDY, target: State.SETNETIF3 }
        ]
        ,
        onEnter: function(state,data,action){
            serial.handleSerial("ifconfig 7 set addr 01\n").then((resultString)=>{
                //console.log(resultString)
                if(resultString.match(/address on interface 7 to 01/)){
                    stateMachine.action(Action.SETNETIF_RDY);
                }
            })
        }
    },
    {
        name: State.SETNETIF3,
        transitions: [
            { action: Action.SETNETIF_RDY, target: State.SETNETIF4 }
        ]
        ,
        onEnter: function(state,data,action){
            serial.handleSerial("ifconfig 7 add fe80::01\n").then((resultString)=>{
                //console.log(resultString)
                if(resultString.match(/to interface 7/)){
                    stateMachine.action(Action.SETNETIF_RDY);
                }
            })
        }
    },
    {
        name: State.SETNETIF4,
        transitions: [
            { action: Action.SETNETIF_RDY, target: State.SETNETIF5 }
        ]
        ,
        onEnter: function(state,data,action){
            serial.handleSerial("ifconfig 7 add 2001:db8::1\n").then((resultString)=>{
                //console.log(resultString)
                if(resultString.match(/to interface 7/)){
                    stateMachine.action(Action.SETNETIF_RDY);
                }
            })
        }
    },
    {
        name: State.SETNETIF5,
        transitions: [
            { action: Action.SETNETIF_RDY, target: State.SETNETIF6 }
        ]
        ,
        onEnter: function(state,data,action){
            serial.handleSerial("rpl init 7\n").then((resultString)=>{
                //console.log(resultString)
                if(resultString.match(/successfully initialized RPL on interface 7/)){
                    stateMachine.action(Action.SETNETIF_RDY);
                }
            })
        }
    },
    {
        name: State.SETNETIF6,
        transitions: [
            { /*action: Action.DODAG_RDY, target: State.READY */action: Action.DODAG_RDY, target: State.NEW_FIBROUTE}
        ]
        ,
        onEnter: function(state,data,action){
            serial.handleSerial("rpl root 1 2001:db8::1\n").then((resultString)=>{
                //console.log(resultString);
                if(resultString.match(/successfully added a new RPL DODAG/)){
                    ///*if(buildstring!="SETUP")*/stateMachine.action(Action.DODAG_RDY);
                    if(buildstring=="SETUP") serial.closeConn(()=>{console.log("Serial closed!")});
                }
            })
        }
    },

    {
        initial: (buildstring!="SETUP"),// Only for debugging
        name: State.NEW_FIBROUTE,
        transitions: [
            {action: Action.NEW_FIB_ITEM, target: State.GET_SENSACT_LIST},
            {action: Action.NO_NEW_FIB_ITEM, target:State.GET_NODES},
            {action: Action.TIMEOUT2, target:State.READY}
        ]
        ,
        onEnter: function (state, data, action) {

            serial.handleSerial("fibroute\n").then((resultString)=>{
                //console.log(resultString);
                if(resultString.match(/2001:db8::3600:3400:757:3156/)){device1 = 1;console.log("device1 rdy");}else device1 = 0;
                if(resultString.match(/2001:db8::1e00:3800:1357:3346/)) {device2 = 1;console.log("device2 rdy");} else device2 = 0;
                stateMachine.action(Action.TIMEOUT2);
                /*
                if(resultString.match(/Destination                             Flags        Next Hop                                Flags      Expires          Interface/)){
                    list_of_nodes = resultString.match(/([0-9a-fA-F]{0,4}:[0-9a-fA-F]{0,4}::[0-9a-fA-F]{0,4}:[0-9a-fA-F]{0,4}:[0-9a-fA-F]{0,4}:[0-9a-fA-F]{0,4})/g);
                    //list_of_nodes = db.getDifference(list_of_nodes); // getDiffrence is baaad TODO
                    if(list_of_nodes != null) {
                        if (list_of_nodes.length) {
                            curr_node.address = list_of_nodes.pop();
                            stateMachine.action(Action.NEW_FIB_ITEM);
                        }
                        else stateMachine.action(Action.NO_NEW_FIB_ITEM);
                    }
                }*/
            })
        }
    },
    {
        name: State.GET_SENSACT_LIST,
        transitions: [
            {action: Action.SENSACT_LIST_ACK, target: State.SENSACT_LIST_ITEM}
        ]
        ,
        onEnter: function (state, data, action) {
            serial.handleSerial("sndpkt " +curr_node.address + " 0 0 0 0 0 0 0 0 0 " +
                ++pkt_cnt + "\n").then(
                (resultString)=>{
                if(resultString.match(/msg         : 1/)){
                    device_cnt = Number(resultString.match(/cnt         : [0-9]*/)[0].match(/[0-9]+/)[0]);
                    for (let i = 0; i < device_cnt ; i++)
                    {
                        curr_node.devices.push({}/*{
                            name: "",
                            dataType: 0,
                            available: true,
                            currentValues: [],
                            getRequestTimeout: date.setSeconds(1),
                            lastGetRequest: date.getDate(),
                            setRequest: true
                        }*/);
                    }
                    device_cnt = 0;
                    stateMachine.action(Action.SENSACT_LIST_ACK);
                }
                else{
                    console.log("BAD MSG IN GET_SENSACT_LIST! GOT STRING:\n"+ resultString);//TODO: ERROR HANDLING + IP ADDR
                }
            })
        }
    },
    {
        name: State.SENSACT_LIST_ITEM,
        transitions: [
            {action: Action.SENSACT_LIST_ITEM_STEP, target: State.SENSACT_LIST_ITEM_2}
        ]
        ,
        onEnter: function (state, data, action) {
            HandleSerial("sndpkt " +curr_node.address + " 2 " + device_cnt + " 0 0 0 0 0 0 0 " +
                ++pkt_cnt + "\n").then((resultString)=>{
                curr_node.devices[device_cnt].name = (resultString.match(/name        : [1-9A-z()]+/)[0].match(/[1-9a-zA-Z]+/));
                //TODO: Fill out device name
                stateMachine.action(Action.SENSACT_LIST_ITEM_STEP);
            })
        }
    },
    {
        name: State.SENSACT_LIST_ITEM_2,
        transitions: [
            {action: Action.DEV_NOT_RDY, target: State.SENSACT_LIST_ITEM},
            {action: Action.FIB_RDY, target: State.GET_NODES},
            {action: Action.FIB_NOT_RDY, target: State.GET_SENSACT_LIST}
        ]
        ,
        onEnter: function (state, data, action) {
            if(++device_cnt < curr_node.devices.length) stateMachine.action(Action.DEV_NOT_RDY);
            else{
                stateMachine.action(Action.FIB_RDY)
            } // TODO: Check if we can pop from from list_of_nodes...and go back with FIB_NOT_RDY
        }
    },
    {
        name: State.GET_NODES,
        transitions: [
            {action: Action.GET_DEVICES, target: State.GET_DEVS}
        ]
        ,
        onEnter: function (state, data, action) {
        }
    },
    {
        name: State.GET_DEVS,
        transitions: [
            {action: Action.GET_DEVLIST_RDY, target: State.GET_DEV}
        ]
        ,
        onEnter: function (state, data, action) {
        }
    },
    {
        name: State.GET_DEV,
        transitions: [
            {action: Action.DEV_STEP, target: State.GET_DEV_2}
        ]
        ,
        onEnter: function (state, data, action) {
        }
    },
    {
        name: State.GET_DEV_2,
        transitions: [
            {action: Action.GET_DEVS_NOT_RDY, target: State.GET_DEV},
            {action: Action.GET_NOT_RDY, target: State.GET_DEVS},
            {action: Action.GET_RDY, target: State.SET_NODES}
        ]
        ,
        onEnter: function (state, data, action) {
        }
    },
    {
        name: State.SET_NODES,
        transitions: [
            {action: Action.SET_DEVICES, target: State.SET_DEVS}
        ]
        ,
        onEnter: function (state, data, action) {
        }
    },
    {
        name: State.SET_DEVS,
        transitions: [
            {action: Action.SET_DEVLIST_RDY, target: State.SET_DEV}
        ]
        ,
        onEnter: function (state, data, action) {
        }
    },
    {
        name: State.SET_DEV,
        transitions: [
            {action: Action.DEV_STEP, target: State.SET_DEV2}
        ]
        ,
        onEnter: function (state, data, action) {
        }
    },
    {
        name: State.SET_DEV_2,
        transitions: [
            {action: Action.SET_RDY, target: State.NEW_FIBROUTE},
            {action: Action.SET_NOT_RDY, target: State.SET_DEVS},
            {action: Action.SET_DEVS_NOT_RDY, target: State.SET_DEV}
        ]
        ,
        onEnter: function (state, data, action) {
        }
    },

    /* END OF STATE MACHINE, ONLY TEMPORARY STATES LEFT*/
    {
        name: State.READY,
        transitions: [
            {action: Action.TIMEOUT, target: State.NEW_FIBROUTE}
        ]
        ,
        onEnter: function (state, data, action) {
            console.log("sndpkt 2001:db8::3600:3400:757:3156 4 0 " + LED_RED1 + " 0 0 0 0 LED(red) 0 "+ ++pkt_cnt);
            serial.handleSerial("sndpkt 2001:db8::3600:3400:757:3156 4 0 " + LED_RED1 + " 0 0 0 0 LED(red) 0 "+ ++pkt_cnt+"\n").then((serialData)=>{
                ++LED_RED1;
                LED_RED1 %=2;
                //console.log("here\n");
                timeoutevent = setTimeout(Timeout, 1000);
            });
        }
    },
    //sndpkt 2001:db8::3600:3400:757:3156 4 0 1 0 0 0 0 LED(RED) 0 20
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
var stateMachine = new sm();
// create multiple states with a config array
serial.openConn().then(()=>{
    stateMachine.start();
})
stateMachine.create(config);
function Timeout(){stateMachine.action(Action.TIMEOUT);}
function Timeout2(){stateMachine.action(Action.TIMEOUT2);}
//setInterval(stateMachine.action(Action.TIMEOUT2), 1000);

// add listener for state change
stateMachine.onChange.add(function(state, data, action) {
    console.log('State has changed to:', state.name);
    //console.log('Got data:', data);
    console.log('Got triggering action:', action);
});
function sndpkt(addr,msg,cnt,val0,val1,val2,unit,scale,new_device,pkt_cnt){
    sp.write("sndpkt " + addr + " " + msg + " " + cnt + " " +val0 + " " + val1 + " " +val2 + " " + unit + " " + scale + " " + new_device + " " +pkt_cnt +"\n");

}

