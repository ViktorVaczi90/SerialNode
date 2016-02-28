var ifconfig_addr;
let buildstring = "SERVER";//"SETUP"
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

let cnt = 0;

/* Listening for the data event, and reading from the binary buffer
 and filling up the string buffer until the end of the message */

/*Variables for the database and state machine: */
let list_of_nodes = [];

sp.on("data", (data)=> {

    /* Converting the binary data to string and adding it to the string buffer */
    buffer.push(data.toString("utf8"));

    /* If the message is over, return the buffer  */
    if (data.toString("utf8").match(">")) {
        /*clearInterval(enter_timeout);
        enter_timeout = setInterval(enterTimeout, 1000);*/
        //serialPort.removeAllListeners();
        let result = buffer.join('');
        //console.log(result);
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
        if (result.match(/Destination                             Flags        Next Hop                                Flags      Expires          Interface/))
        {// result of fibroute
            stateMachine.action(Action.NEW_FIB_ITEM);
            list_of_nodes = result.match(/\n([0-9a-fA-F]{0,4}:[0-9a-fA-F]{0,4}::[0-9a-fA-F]{0,4}:[0-9a-fA-F]{0,4}:[0-9a-fA-F]{0,4}:[0-9a-fA-F]{0,4})/g);//Get ips
            console.log(list_of_nodes);
            buffer = [];
        }
        /*if (result.match(/Success: send 34 byte/)|| result.match(/Destination                             Flags        Next Hop/)){
            stateMachine.action(Action.TIMEOUT);
            buffer = [];
        }
        if (result.match(/msg         :/)){
            clearTimeout(timeoutevent);
            stateMachine.action(Action.TIMEOUT2);
            buffer = [];

        }*/

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
        //initial: true,
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
            { /*action: Action.DODAG_RDY, target: State.READY */action: Action.DODAG_RDY, target: State.NEW_FIBROUTE}
        ]
        ,
        onEnter: function(state,data,action){
            sp.write("ifconfig 7 add 2001:db8::1\n"+
            "rpl init 7\n"+
            "rpl root 1 2001:db8::1\n");
        }
    },

    {
        initial: true,// Only for debugging
        name: State.NEW_FIBROUTE,
        transitions: [
            {action: Action.NEW_FIB_ITEM, target: State.GET_SENSACT_LIST},
            {action: Action.NO_NEW_FIB_ITEM, target:State.GET_NODES}
        ]
        ,
        onEnter: function (state, data, action) {
            sp.write("fibroute\n");
        }
    },
    {
        name: State.GET_SENSACT_LIST,
        transitions: [
            {action: Action.SENSACT_LIST_ACK, target: State.SENSACT_LIST_ITEM}
        ]
        ,
        onEnter: function (state, data, action) {
            sp.close();
        }
    },
    {
        name: State.SENSACT_LIST_ITEM,
        transitions: [
            {action: Action.SENSACT_LIST_ITEM_STEP, target: State.SENSACT_LIST_ITEM_2}
        ]
        ,
        onEnter: function (state, data, action) {

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
            {action: Action.TIMEOUT, target: State.WRITELED}
        ]
        ,
        onEnter: function (state, data, action) {

            i++;
            i %= leds.length;
            sp.close();
            //sp.write(leds[i]);
            //timeoutevent = setTimeout(Timeout, 1000);
        }
    },
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
let enter_timeout;
/*Write enter to the serial output in order to get back the shell prompt  This event should be called in every catched serial buffer like:
 clearInterval(enter_timeout,);
 enter_timeout = setInterval(enterTimeout, 1000);*/
function enterTimeout(){sp.write("\n")};
function Timeout(){stateMachine.action(Action.TIMEOUT);}
function Timeout2(){stateMachine.action(Action.TIMEOUT2);}
//setInterval(stateMachine.action(Action.TIMEOUT2), 1000);
// create multiple states with a config array
stateMachine.create(config);

// add listener for state change
stateMachine.onChange.add(function(state, data, action) {
    console.log('State has changed to:', state.name);
    //console.log('Got data:', data);
    console.log('Got triggering action:', action);
});/*int sndpkt(int argc, char **argv)
 {
 if (argc != 12) printf(
 "Not enough arguments!Usage:\n1: addr\n2: msg\n3: cnt\n4: data->val[0]\n5: data -> val[1]\n6: data ->val[2]\n7: data->unit\n8: data->scale\n9: name\n10: new_device\n");
 //printf("sending pkt to %s!\n", argv[1]);
 rfnode_pkt pkttemp;
 rfnode_pkt* pkt = &pkttemp;
    pkt->msg = (pkt_msg)atoi(argv[2]);
    pkt->cnt = (uint16_t)atoi(argv[3]);
    pkt->data.val[0] = (int16_t)atoi(argv[4]);
    pkt->data.val[1] = (int16_t)atoi(argv[5]);
    pkt->data.val[2] = (int16_t)atoi(argv[6]);
    pkt->data.unit = (uint8_t)atoi(argv[7]);
    pkt->data.scale = (int8_t)atoi(argv[8]);
strcpy(pkt->name, argv[9]);
    pkt->new_device = (uint8_t)atoi(argv[10]);
    pkt->pkt_cnt = (uint32_t)atoi(argv[11]);
ipv6_addr_t addr;
if (ipv6_addr_from_str(&addr, argv[1]) == NULL) {
    puts("Error: unable to parse destination address\n");
    return -1;
}
rfnode_udpsend(addr, (uint16_t) 12345,(char*) pkt, 1,
    (unsigned int) 1000000);
return 0;
}*/
function sndpkt(addr,msg,cnt,val0,val1,val2,unit,scale,new_device,pkt_cnt){
    sp.write("sndpkt " + addr + " " + msg + " " + cnt + " " +val0 + " " + val1 + " " +val2 + " " + unit + " " + scale + " " + new_device + " " +pkt_cnt +"\n");

}

