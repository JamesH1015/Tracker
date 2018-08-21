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
    },

    store: function (ajaxList) {
        this.list = ajaxList
    }
}

let UserProfile = {

    action: function (request) {
        switch (request.action) {
        
        case 'AUTHENTICATE_USER':
            this.authenticateUser(request.message)
            break
        }
    }
}

let Utilities = {
    queryServer: function (query, path, response, error) {
        let ajaxOBJ = {
            method: 'GET', url: path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (result) => { response(result) })
        .fail( () => { error() })
    }
}
