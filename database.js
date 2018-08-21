/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

/** MongoDB Driver **/
    const Mongo = require('mongodb').MongoClient
    const ObjectId = require('mongodb').ObjectID

/** Create Database Path and Schema Objects**/
    let dbPath = ''
    let dbName = ''

/** Initialize Database Path and Schema **/
    exports.initialize = function (configPath, configDatabase) {
        dbPath = configPath
        dbName = configDatabase
    }

/** MongoDB find Function **/
    exports.get = function (api) {
        if (api.find == '') { api.find = {} }
        for (var key in api.sort) {
            if (api.sort[key] == '1') { api.sort[key] = 1 }
            if (api.sort[key] == '-1') { api.sort[key] = -1 }
        }
        if ('_id' in api.find) {
            api.find._id = ObjectId(api.find._id)
        }
        if ('proj_ID' in api.find) {
            api.find.proj_ID = ObjectId(api.find.proj_ID)
        }

    //  Create new promise object
        return new Promise((resolve, reject) => {

        //  Connect to Mongodb database
            Mongo.connect(dbPath, (err, client) => {
                if (err) { return reject(err) }

            //  Set database collection
                let db = client.db(dbName)
                let cl = db.collection(api.coll)

            //  Find documents
                cl.find(api.find).sort(api.sort)
                  .toArray((err, resultARY) => {
                      if (err) { return reject(err) }
                      client.close()
                      return resolve(resultARY)
                })
            })
        })
    }
