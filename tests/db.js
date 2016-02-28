"use strict";

const db = require("../src/db");
const crypto = require('crypto');
const hash = crypto.createHash('md5');


/* Creating dummy data for db */
function generateNodes (){
    for (let i = 0; i < 10; ++i) {
        db.insertNode({
            //_id: ObjectId,
            address: makeid(),
            error: Math.floor(Math.random() * 100) % 2 ? true : false,
            newDeviceRequest: Math.floor(Math.random() * 100) % 2 ? true : false,
            devices: [
                {
                    dataType: 2,
                    available: Math.floor(Math.random() * 100) % 2 ? true : false,
                    currentValues: [],
                    getRequestTimeout: Date.now(),
                    lastGetRequest: Date.now(),
                    setRequest: Math.floor(Math.random() * 100) % 2 ? true : false
                }
            ]
        });
    }
}

function makeid () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


//db.getNode({address : "p0Fh7b3PWiMJL2dH"}).then( (node)=>{
//   console.log("Required node: ", node)
//});
//
//db.getNode({address : "Wrong node"}).then( (node)=>{
//    console.log("Wrong node: ", node)
//});