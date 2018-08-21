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
    }
}
