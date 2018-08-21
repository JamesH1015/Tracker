/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

$(document).ready( function () {

/** Create Page Components **/
    let Start = Object.create(SignInForm)
    let Message = Object.create(ModalMessage)
    let Menu = Object.create(NavigationBar)

/** Data Model Functions **/

//  Authenticate user credentials
    UserProfile.authenticateUser = function (credentials) {
        if (credentials.username == '') {
            Message.display('Missing information. Enter username.')
        }
        else if (credentials.password == '') {
            Message.display('Missing information. Enter password.')
        }
        else {
            this.queryServer(credentials, '/start/authenticate',
            function (result) {
                console.log(result)
            })
        }
    }

/** Initialize Page Components **/
    Start.initialize({
        usernameInput: '#inp-username',
        passwordInput: '#inp-password',
        signinButton: '#btn-start'
    })

    Message.initialize({
        modal: '#modal-message',
        text: '#modal-message-text'
    })

    Menu.initialize({
        navLinks: '.navbar-brand, .nav-link'
    })
})
