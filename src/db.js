"use strict";

/* Importing stuff and defining constants */
const mongoose = require('mongoose');
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
            name : String,
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


/**
 * This function inserts a node to the db. Before inserting the node it queries the db for it to forbid
 * inserting a node multiple times.
 * @param nodeObject
 * @returns {Promise|boolean} - Returns true if the node was inserted to the db.
 * Returns false when the node cannot be inserted to the db or an error happened.
 * If an error happens it's logged to the console.
 */
db.insertNode = function (nodeObject) {
    /* Querying the node from the db */
    let queryResult = Node.find({address: nodeObject.address}).exec(
        (err, res) => {
            if (err) console.log(err);
            else return res
        }
    );
    /* Inserting the node to the db*/
    return queryResult.then((dbNode) => {
        if (dbNode.length === 0) {
            let node = new Node(nodeObject);

            return node.save((err, node)=> {
                if (err) {
                    console.log(err);
                    return false
                }
                else {
                    console.log("Inserted", node._id);
                    return true
                }
            });
        } else {
            return true
        }
    });
};

/**
 * This function returns a promise to the result of the query from the database
 * @param {array} fibrouteList - An array of strings where each element is a ipv6 id that was received from serial.
 * @returns {Promise|Object} - A promise when resolved, will contain an array of strings that is the list of the .
 */
db.getDifference = function (fibrouteList) {

    return new Promise((resolve, reject) => {
        Node.find({})
            .select({error : 1, address : 1, _id: 0})
            .exec((err, res)=>{
            /* If something went wrong*/
            if (err) reject(err);
            /* If everything is okay */
            else resolve(res);
        });
    }).then((networkIDs)=>{
        let errorNetworkIDs = [];
        let okNetworkIDs = [];
        let newNetworkIDs = [];

        for (let obj of networkIDs) {
            if (obj.error == true) errorNetworkIDs.push(obj.address);
            else {okNetworkIDs.push(obj.address)}
        }

        for (let id of fibrouteList) {
            if (errorNetworkIDs.indexOf(id) == -1 || okNetworkIDs.indexOf(id) == -1) newNetworkIDs.push(id)
        }

        /* TODO: if needed use the other two arrays */

        return networkIDs.concat(errorNetworkIDs)
    })
};

/**
 * This function returns nodes from the db based on the queryObject.
 * @param {Object} queryObj - A valid MongoDB query object
 * @returns {Promise|P|*} - A promise that holds the nodes that fulfill the query or if nothing can be fetched from the db it contains an empty array.
 */
db.getNodes = function (queryObj){
    return new Promise((resolve, reject)=>{
        Node.find(queryObj).exec((err, res)=>{
            if (err) reject(err);
            else resolve(res)
        })
    })
};

//TODO: remove this when testing is done
db.dropDocuments = function (queryObj){
    Node.remove(queryObj).exec((err, success)=>{
        if (err) {
            console.log(err);
            return false
        } else {
            return true
        }
    })
};

/* exporting the db namespace */
module.exports = db;