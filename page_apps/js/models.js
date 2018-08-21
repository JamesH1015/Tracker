/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let Dispatch = function (request) {
    ProjectsList.action(request)
    UserProfile.action(request)
}

let ProjectsList = {

    list: [],

    action: function (request) {
        switch (request.action) {
        
        case 'RETRIEVE_PROJECTS_LIST':
            this.retrieve()
            break
        }
    }
}

let UserProfile = {

    action: function (request) {
        switch (request.action) {
        
        case 'AUTHENTICATE_USER':
            this.authenticateUser(request.message)
            break
        }
    },
    
    queryServer: function (cred, path, response) {
        let ajaxOBJ = {
            method: 'GET', url: path,
            data: { username: cred.username, password: cred.password },
            dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (result) => { response(result) })
         .fail( () => {
             console.log('Sign In Form AJAX request failed.')
        })
    }
}

let Utilities = {
    queryServer: function (query, path, response) {
        let ajaxOBJ = {
            method: 'GET', url: path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (result) => { response(result) })
        .fail( () => {
            console.log('ERROR: AJAX request failed!')
        })
    }
}
