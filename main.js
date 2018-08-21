/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

/** Express Web Server **/

//  Load Express 4 Module
    const express = require('express')

//  Application Configuration Settings
    const conf = require('./config')

//  Load Databse Module
    const db = require('./database')

//  Initialize Database Module
    db.initialize(conf.mongo.path, conf.mongo.database)

//  Create Express Application
    const ws = express()

//  Serve Static Files
    ws.use(express.static(__dirname + conf.apps))

//  Start HTTP Server
    ws.listen(conf.port, () => {
        console.log(`${conf.name} running on port ${conf.port}`)
        console.log('Press Ctrl-C to terminate')
    })

//  Serve Default Route
    ws.get('/', function(req, res) {
        res.sendFile(__dirname + conf.apps + '/welcome.html')
    })

/** AUTHENTICATION **/

//  Authenticate User
ws.get('/start/authenticate', function (req, res) {
    username = req.query.username
    password = req.query.password
    if ((username == 'REIuser') && (password == 'qwerty')) {
        res.json({ success: true, name: username, path: '/navigator' })
    } else {
        res.json({ success: false, name: null, path: null })
    }
})

/** AUTHENTICATED ROUTES **/

//  Serve Navigator Application
ws.get('/navigator', function (req, res) {
    res.sendFile(__dirname + conf.apps + '/navigator.html')
})

//  GET Resource
    ws.get('/:appl/:coll', function (req, res) {
        let api = {
            appl: req.params.appl,
            coll: req.params.coll,
            find: req.query.find,
            sort: req.query.sort,
            user: req.user
        }
        db.get(api).then( (results) => {  res.json(results) })
          .catch( (err) => { res.send(err) })
    })
