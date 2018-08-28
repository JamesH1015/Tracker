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
    ProjectsList.query = function () {
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
    ProjectItems.query = function (projectID) {
        let query = { find: { proj_ID: projectID }, sort: null }
        let path = '/navigator/parts'
        Utilities.queryServer(query, path, function (result) {
        
        //  Store project data
            ProjectItems.store(result)

        //  Initial sidebar data
            let nodeList = []
            for (node in ProjectItems.ancestors) {
                nodeList.push(node)
            }
            let rootID = ProjectItems.rootItem._id
            let sideBarData = {
                nodes: nodeList,
                root: {
                    id: rootID,
                    partNum: ProjectItems.rootItem.part_TAG,
                    desc: ProjectItems.rootItem.dscr_STR,
                    nodes: ProjectItems.ancestors[rootID].nodes
                }
            }
            SideBar.action({
                action: 'INITIALIZE_SIDEBAR',
                message: sideBarData
            })

        //  Initial parts grid data
            Grid.action({
                action: 'DISPLAY_GRID_ITEMS',
                message: ProjectItems.ancestors[rootID].leafs
            })

        }, function () {
            Message.display('ERROR: Project Items AJAX request failed!')
        })
    }

//  Initialze sidebar
    SideBar.initialize = function (data) {

    //  Initialize sidebar store
        this.store(data.nodes)

    //  Render root node with item info
        let root = data.root
        this.previous.node = root.id
        this.previous.level = 0
        this.nodes[root.id].state = 'open'
        this.nodes[root.id].level = 0
        Assemblies.renderRoot(root.id, root.partNum, root.desc)
        Assemblies.highlightNode(root.id, 'on')

    //  Display top level assemblies
        let level = 1
        this.updateState(root.nodes, 'closed', level)
        this.updateRecent(root.id, root.nodes, 0)
        Assemblies.renderNodes(root.id, root.nodes, level)
    }

//  Display subnodes and items of selected node
    SideBar.displaySelected = function (nodeID) {
        let level = this.nodes[nodeID].level

    //  Display selected node part data
        let leafs = ProjectItems.action({
            action: 'RETRIEVE_PROJECT_DATA_BY_ANCESTOR',
            message: { id: nodeID, type: 'leafs' }
        })

        Grid.action({
            action: 'DISPLAY_GRID_ITEMS',
            message: leafs
        })

    //  Open subnodes if not already open
        if (this.nodes[nodeID].state == 'closed') {

        //  Update subnodes state and level and render them
            let nodes = ProjectItems.action({
                action: 'RETRIEVE_PROJECT_DATA_BY_ANCESTOR',
                message: { id: nodeID, type: 'nodes' }
            })
            let sublevel = this.nodes[nodeID].level + 1
            if (level != 0) { Assemblies.renderNodes(nodeID, nodes, sublevel) }

        //  Close previous subnodes
            this.nodes[this.previous.node].state = 'closed'
            this.closeSubnodes(level)
            this.updateState(nodes, 'closed', sublevel)
            if (this.previous.level != 0) {
                Assemblies.toggleArrows(this.previous.node, 'close')
            }
            Assemblies.highlightNode(this.previous.node, 'off')

        //  Update selected node info
            this.previous.node = nodeID
            this.previous.level = level
            this.nodes[nodeID].state = 'open'
            if (level != 0) { Assemblies.toggleArrows(nodeID, 'open') }
            Assemblies.highlightNode(nodeID, 'on')
            this.updateRecent(nodeID, nodes, level)
        }
    }

//  Close selected node
    SideBar.closeSubnodes = function (level) {
        let firstLevel = 1
        if (level != 0) { firstLevel = level }
        for (let idx = firstLevel; idx < this.recent.length; idx++) {
            if (this.recent[idx] != null) {
                let recentNodes = this.recent[idx].nodes
                let recentID = this.recent[idx].id
                for (let idy = 0; idy < recentNodes.length; idy++) {
                    this.nodes[recentID].state = 'closed'
                    Assemblies.removeNode(recentNodes[idy])
                }
            }
            this.recent[idx] = null
        }
    }

//  Display items
    Grid.display = function (items) {
        Parts.renderHead(view)
        Parts.renderBody(view, items)
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
