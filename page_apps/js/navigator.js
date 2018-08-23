/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

$(document).ready( function () {

/** Create Page Components **/
    let Projects = Object.create(ProjectSelector)
    let Assemblies = Object.create(SideBarGroup)
    let Parts = Object.create(DataGrid)
    let Message = Object.create(ModalMessage)
    let Menu = Object.create(NavigationBar)

/** Data Model Functions **/

    let view = [
        { "title": "Part Num", "width": "2", "field": "part_TAG",
            "dtype": "string", "edit": true },
        { "title": "Description", "width": "3", "field": "dscr_STR",
            "dtype": "string", "edit": true },
        { "title": "Mfr", "width": "1", "field": "mfr_STR",
            "dtype": "string", "edit": true },
        { "title": "Unit Qty", "width": "1", "field": "unit_QTY",
            "dtype": "number", "edit": true },
        { "title": "Total Qty", "width": "1", "field": "total_QTY",
            "dtype": "number", "edit": true },
        { "title": "Vendor", "width": "1", "field": "vendor_STR",
            "dtype": "string", "edit": true },
        { "title": "Note", "width": "2", "field": "note_STR",
            "dtype": "string", "edit": true },
        { "title": "Status", "width": "1", "field": "status_STR",
            "dtype": "string", "edit": true }
    ]

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

        //  Update top level assemblies state and level and render them
            let nodes = ProjectItems.ancestors[rootId].nodes
            let level = 1
            ProjectItems.updateState(rootId, nodes, 'closed', level)
            Assemblies.renderNodes(rootId, nodes, level)

        //  Render parts grid
            let leafs = ProjectItems.ancestors[rootId].leafs
            Parts.renderHead(view)
            Parts.renderBody(view, leafs)

        }, function () {
            Message.display('ERROR: Project Items AJAX request failed!')
        })
    }

//  Display node data
    ProjectItems.display = function (nodeID) {
        nodeState = this.sideNodes[nodeID].state
        if (nodeState == 'closed') {
        //  Change node state to open
            this.sideNodes[nodeID].state = 'open'
            Assemblies.toggleState(nodeID, 'open')

        //  Update subnodes state and level and render them
            let nodes = this.ancestors[nodeID].nodes
            let level = this.sideNodes[nodeID].level + 1
            this.updateState(nodeID, nodes, 'closed', level)
            Assemblies.renderNodes(nodeID, nodes, level)
        } else {
        //  Change node state to close
            this.sideNodes[nodeID].state = 'closed'
            Assemblies.toggleState(nodeID, 'closed')

        //  Update subnodes state and level and remove them
            for (node in this.sideNodes) {
                if (this.sideNodes[node].parents.includes(nodeID)) {
                    this.sideNodes[node].state = 'closed'
                    Assemblies.removeNode(node)
                }
            }
        }
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

    Parts.initialize({
        headId: '#grid-header',
        bodyId: '#grid-body'
    })

    Message.initialize({
        modal: '#modal-message',
        text: '#modal-message-text'
    })

    Menu.initialize({
        navLinks: '.navbar-brand, .nav-link'
    })
})
