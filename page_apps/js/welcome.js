/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

/** Menu **/
let MenuCP = Object.create(NavigationBar)

    MenuCP.initialize({
        navLinks: '.navbar-brand, .nav-link'
    })

/** Message **/
let NotificationCP = Object.create(ModalMessage)

    NotificationCP.initialize({
        modal: '#modal-message',
        text: '#modal-message-text'
    })

/** Application Initialization **/
let PageCP = Object.create(Page)

    Application.initialize({
        page: PageCP,
        menu: MenuCP,
        note: NotificationCP
    })

    Application.start( function () { })

/** User Profile **/
let SignInCP = Object.create(SignInForm)

    SignInCP.initialize({
        usernameInput: '#inp-username',
        passwordInput: '#inp-password',
        signinButton: '#btn-start'
    })

    UserProfile.__proto__ = Application

    UserProfile.initialize({
        signIn: SignInCP,
        queryPATH: '/welcome/users'
    })
