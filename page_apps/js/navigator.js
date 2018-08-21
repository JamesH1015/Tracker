/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

$(document).ready( function () {

/** Create Page Components **/
    let Message = Object.create(ModalMessage)
    let Menu = Object.create(NavigationBar)

/** Data Model Functions **/

/** Initialize Page Components **/

    Message.initialize({
      modal: '#modal-message',
      text: '#modal-message-text'
    })

    Menu.initialize({
      navLinks: '.navbar-brand, .nav-link'
    })
})
