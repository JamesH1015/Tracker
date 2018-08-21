/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

$(document).ready( function () {

/** Create Page Components **/
    let Projects = Object.create(ProjectSelector)
    let Message = Object.create(ModalMessage)
    let Menu = Object.create(NavigationBar)

/** Data Model Functions **/

//  Retrieve projects list from web server
    ProjectsList.retrieve = function () {
        let query = { find: null, sort: { proj_TAG: 1 } }
        let path = '/navigator/projects'
        Utilities.queryServer(query, path, function (result) {
            Projects.render(result)
        })
    }

/** Initialize Page Components **/
    Projects.initialize({
        selector: '#select-project'
    })

    Message.initialize({
      modal: '#modal-message',
      text: '#modal-message-text'
    })

    Menu.initialize({
      navLinks: '.navbar-brand, .nav-link'
    })
})
