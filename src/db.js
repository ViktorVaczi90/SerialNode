"use strict";

/* Importing stuff and defining constants */
const mongoose = require('mongoose');
//-const ObjectID = mongoose.ObjectId; /* TODO: Remove if not needed */
const Schema = mongoose.Schema;

/* Establishing the connection to the db*/
mongoose.connect('mongodb://localhost/riotDevices');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to db!")
});

/* Defining the structure of node documents, mongo ids (_id) are automatically generated so ther is
 * no need to define them here */
let nodeSchema = new Schema({
    address: String,
    error: Boolean,
    newDeviceRequest: Boolean,
    devices: [
        {
            dataType: Number,
            available: Boolean,
            currentValues: [],
            getRequestTimeout: Date,
            lastGetRequest: Date,
            setRequest: Boolean
        }
    ]
});

/* A class that can be used to create objects with the predefined schema*/
let Node = mongoose.model("Node", nodeSchema);



db.insertNode = function (nodeObject) {
    /* Check whether the node is already in the db */
    Node.find({address: nodeObject.address}).exec(
        (err, res) => {
            if (err) console.log(err); // TODO: handle empty
            else return res
        }
    ).then(()=>{
            let node = new Node(nodeObject);

            node.save((err, node)=>{
                if (err) console.log(err);
                else {console.log("Inserted",node._id)}
            })
        });

    /* TODO: add a callback or return */
};

/**
 * This function returns a promise to the result of the query from the database
 * @param {array} addressList - An array of strings. Each string is a device's network id.
 * @returns {Promise|P} - A promise when resolved, will contain an array of Node type objects.
 */
db.getDifference = function (addressList) {
    /* Query for selecting the nodes that have error or new on the fibroute */
    let queryObj = {
        $or: [
            {address: { $nin : addressList}},
            {error : true}
        ]
    };

    return new Promise((resolve, reject) => {
        Node.find(queryObj).exec((err, res)=>{
            /* If something went wrong*/
            if (err) reject(err);
            /* If everything is okay */
            else resolve(res);
        });
    });
};

/*TODO: doc, error handling, validating*/
db.getNode = function (queryObj){
    return new Promise((resolve, reject)=>{
        Node.find(queryObj).exec((err, res)=>{
            if (err) reject(err);
            else resolve(res)
        })
    })
};

/* exporting the db namespace */
module.exports = db;