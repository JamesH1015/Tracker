/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

$(document).ready( function () {

/** Create Page Components **/
    let Projects = Object.create(ProjectSelector)
    let Assemblies = Object.create(SideBarGroup)
    let Message = Object.create(ModalMessage)
    let Menu = Object.create(NavigationBar)

/** Data Model Functions **/

//  Retrieve projects list from web server
    ProjectsList.retrieve = function () {
        let query = { find: null, sort: { proj_TAG: 1 } }
        let path = '/navigator/projects'
        Utilities.queryServer(query, path, function (result) {
            if (result != null) {
                ProjectsList.store(result)
                Projects.render(result)
            } else {
                Message.display('ERROR: Projects not found.')
            }
        }, function () {
            Message.display('ERROR: Projects List AJAX request failed!')
        })
    }

//  Retrieve projects items from web server
    ProjectItems.retrieve = function (projectID) {
        let query = { find: { proj_ID: projectID }, sort: null }
        let path = '/navigator/parts'
        Utilities.queryServer(query, path, function (result) {
            ProjectItems.store(result)

        //  Render project Node with item info
            let rootId = ProjectItems.rootItem._id
            let rootPartNum = ProjectItems.rootItem.part_TAG
            let rootDesc = ProjectItems.rootItem.dscr_STR
            Assemblies.renderRoot(rootId, rootPartNum, rootDesc)

        //  Render top level assemblies
            let nodes = ProjectItems.ancestors[rootId].nodes
            Assemblies.renderNodes(rootId, nodes)
        }, function () {
            Message.display('ERROR: Project Items AJAX request failed!')
        })
    }

/** Initialize Page Components **/
    Projects.initialize({
        selector: '#select-project'
    })

    Assemblies.initialize({
        listId: '#sidebar',
        circleIcon: 'img/circle.png',
        closedIcon: 'img/closed.png',
        expandIcon: 'img/expand.png'
    })

    Message.initialize({
        modal: '#modal-message',
        text: '#modal-message-text'
    })

    Menu.initialize({
        navLinks: '.navbar-brand, .nav-link'
    })
})
