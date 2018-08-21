/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let Dispatch = function (request) {
    UserProfile.action(request)
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
