/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

/** Express Web Server **/

//  Load Express 4 Module
    const express = require('express')

//  Application Configuration Settings
    const conf = require('./config')

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
