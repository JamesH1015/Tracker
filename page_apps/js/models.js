/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let Application = {

    initialize: function (init) {
        this.page = init.page
        this.menu = init.menu
        this.note = init.note
    },

    start: function (func) { this.page.ready(func) }
}

let Dispatch = function (request) {
    ProjectsList.action(request)
    ViewsList.action(request)
    ProjectItems.action(request)
    Assemblies.action(request)
    Parts.action(request)
    UserProfile.action(request)
}

let ProjectsList = {

    initialize: function (init) {
        this.selector = init.selector
        this.queryPATH = init.queryPATH
    },

    action: function (request) {
        switch (request.action) {
        
        case 'QUERY_PROJECTS_LIST':
            this.queryServer(this.queryPATH)
            break
        
        case 'DISPLAY_SELECTED_PROJECT':
            this.projectID = request.message
            Dispatch({
                action: 'QUERY_PROJECT_DATA',
                message: this.projectID
            })
            break
        }
    },

    store: function (itemsARY) {
        this.itemsARY = itemsARY
        this.displayItems(this.itemsARY)
    },

    displayItems: function (itemsARY) {
        this.selector.render(itemsARY)
    },

    queryServer: function (pathSTR) {
        let queryOBJ = { find: null, sort: { proj_TAG: 1 } }
        let ajaxOBJ = {
            method: 'GET', url: pathSTR,
            data: queryOBJ, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (resultsARY) => {
            if (resultsARY != null) { this.store(resultsARY) }
            else {
                this.note.display('ERROR: Projects not found.')
            }
        })
        .fail( () => {
            this.note.display('ERROR: Projects List AJAX request failed!')
        })
    }
}

let ViewsList = {

    initialize: function (init) {
        this.selector = init.selector
        this.viewIDX = init.viewIDX
        this.queryPATH = init.queryPATH
    },

    action: function (request) {
        switch (request.action) {

        case 'QUERY_VIEWS_LIST':
            this.queryServer(this.queryPATH)
            break

        case 'RETRIEVE_SELECTED_VIEW':
            return this.itemsARY[this.viewIDX].format

        case 'DISPLAY_SELECTED_VIEW':
            this.viewIDX = request.message
            break
        }
    },

    store: function (itemsARY) {
        this.itemsARY = itemsARY
        this.displayItems(this.itemsARY)
    },

    displayItems: function (itemsARY) {
        this.selector.render(itemsARY)
    },

    queryServer: function (pathSTR) {
        let queryOBJ = { find: null }
        let ajaxOBJ = {
            method: 'GET', url: pathSTR,
            data: queryOBJ, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (resultsARY) => {
            if (resultsARY != null) { this.store(resultsARY) }
            else {
                this.note.display('ERROR: Views not found.')
            }
        })
        .fail( () => {
            this.note.display('ERROR: Views List AJAX request failed!')
        })
    }
}

let ProjectItems = {

    initialize: function (propsOBJ) {
        this.queryPATH = propsOBJ.queryPATH
    },

    action: function (request) {
        switch (request.action) {
        
        case 'QUERY_PROJECT_DATA':
            this.queryServer(this.queryPATH, request.message)
            break

        case 'RETRIEVE_NODE_ITEMS_BY_TYPE':
            let id = request.message.id
            let type = request.message.type
            return this.ancestors[id][type]
        }
    },

    store: function (items) {
        this.ancestors = {}
        let itemsLEN = items.length
    //  Hash ancestors as keys into an object
    //  and create 'nodes' and 'leafs' arrays for each ancestor
        let idx = 0
        while (idx < itemsLEN) {
            let itemAncestor = items[idx]['parent_ID']
            if (!(itemAncestor in this.ancestors)) {
                if ((itemAncestor != null) && (itemAncestor != '')) {
                    this.ancestors[itemAncestor] = {
                        info: {
                            name: items[idx]['part_TAG'],
                            desc: items[idx]['dscr_STR']
                        },
                        nodes: [], leafs: []
                    }
                } else {
                    this.rootItem = items[idx]['_id']
                    this.ancestors[items[idx]['_id']] = {
                        info: {
                            name: items[idx]['part_TAG'],
                            desc: items[idx]['dscr_STR']
                        },
                        nodes: [], leafs: []
                    }
                }
            }
            idx++
        }
    //  Sort the children of an ancestor into 'nodes' and 'leafs'
    //  and push them into arrays mapped to the ancestor
        let idy = 0
        while (idy < itemsLEN) {
            let itemID = items[idy]['_id']
            let itemAncestor = items[idy]['parent_ID']
            if (itemID in this.ancestors) {
                if ((itemAncestor != null) && (itemAncestor != '')) {
                    this.ancestors[itemAncestor].nodes.push(items[idy])
                }
            } else{
                this.ancestors[itemAncestor].leafs.push(items[idy])
            }
            idy++
        }

        this.displayItems()
    },

    displayItems: function () {
        let nodes = {}
        for (key in this.ancestors) {
            nodes[key] = {
                id: key,
                name: this.ancestors[key].info.name,
                desc: this.ancestors[key].info.desc
            }
        }
        Dispatch({
            action: 'DISPLAY_INITIAL_PROJECT_ITEMS',
            message: {
                rootID: this.rootItem,
                nodes: nodes
            }
        })
    },

    queryServer: function (pathSTR, projectID) {
        let queryOBJ = { find: { proj_ID: projectID }, sort: null }
        let ajaxOBJ = {
            method: 'GET', url: pathSTR,
            data: queryOBJ, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (resultsARY) => {
            if (resultsARY != null) { this.store(resultsARY) }
            else {
                this.note.display('ERROR: Project Items not found.')
            }
        })
        .fail( () => {
            this.note.display('ERROR: Project Items AJAX request failed!')
        })
    }
}

let Assemblies = {

    initialize: function (propsOBJ) {
        this.component = propsOBJ.componentOBJ
    },

    action: function (request) {
        switch (request.action) {

        case 'DISPLAY_INITIAL_PROJECT_ITEMS':
            this.storeNodes(request.message)
            break
        
        case 'DISPLAY_SELECTED_NODE_ITEMS':
            Dispatch({
                action: 'DISPLAY_GRID_ITEMS',
                message: request.message
            })
            this.component.highlightNode(this.previous.node, 'off')
            this.component.highlightNode(request.message, 'on')
            this.displaySubNodes(request.message)
            break
        }
    },

    storeNodes: function (param) {
        let rootID = param.rootID
        this.nodes = param.nodes
        for (key in this.nodes) {
            this.nodes[key].state = 'closed'
            this.nodes[key].level = null
        }
        this.displayRoot(this.nodes[rootID])

        this.displaySubNodes(rootID)
    },

    displayRoot: function (nodeOBJ) {
        this.nodes[nodeOBJ.id].state = 'closed'
        this.nodes[nodeOBJ.id].level = 0
        this.previous = { node: '', level: null }
        this.previous.node = nodeOBJ.id
        this.previous.level = 0
        this.recent = []
        this.component.renderRoot(nodeOBJ)
        this.component.highlightNode(nodeOBJ.id, 'on')

        Dispatch({
            action: 'DISPLAY_GRID_ITEMS',
            message: nodeOBJ.id
        })
    },

    displaySubNodes: function (nodeID) {
        let level = this.nodes[nodeID].level
        let sublevel = level + 1

    //  Close previous subnodes
        this.closeSubNodes(level)
        this.nodes[this.previous.node].state = 'closed'
        if (this.previous.level != 0) {
            this.component.toggleArrows(this.previous.node, 'close')
        }

        if (this.nodes[nodeID].state == 'closed') {

        //  Update subnodes state and level and render them
            let items = ProjectItems.action({
                action: 'RETRIEVE_NODE_ITEMS_BY_TYPE',
                message: { id: nodeID, type: 'nodes' }
            })

        //  Update selected node info
            this.component.renderNodes(nodeID, items, sublevel)
            this.previous.node = nodeID
            this.previous.level = level
            this.nodes[nodeID].state = 'open'
            if (level != 0) {
                this.component.toggleArrows(nodeID, 'open')
            }
            this.updateRecent(nodeID, items, level)
            this.updateState(items, sublevel)
        }
    },

    closeSubNodes: function (level) {
        let firstLevel = 1
        if (level != 0) { firstLevel = level }
        for (let idx = firstLevel; idx < this.recent.length; idx++) {
            if (this.recent[idx] != null) {
                let recentNodes = this.recent[idx].nodes
                for (let idy = 0; idy < recentNodes.length; idy++) {
                    this.nodes[recentNodes[idy]].state = 'closed'
                    this.component.removeNode(recentNodes[idy])
                }
            }
            this.recent[idx] = null
        }
    },

    updateState: function (subnodes, level) {
        for (let idx = 0; idx < subnodes.length; idx++) {
            let nodeID = subnodes[idx]['_id']
            this.nodes[nodeID].level = level
        }
    },

    updateRecent: function (nodeID, nodes, level) {
        this.recent[level] = { id: nodeID, nodes: [] }
        for (let idx = 0; idx < nodes.length; idx++) {
            this.recent[level].nodes.push(nodes[idx]._id)
        }
    }
}

let Parts = {

    initialize: function (propsOBJ) {
        this.component = propsOBJ.componentOBJ
    },

    action: function (request) {
        switch (request.action) {

        case 'DISPLAY_GRID_ITEMS':
            let nodeID = request.message
            let leafs = ProjectItems.action({
                action: 'RETRIEVE_NODE_ITEMS_BY_TYPE',
                message: { id: nodeID, type: 'leafs' }
            })
            this.display(leafs)
            break
        }
    },

    display: function(items) {
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        this.component.render({ format: view, rows: items })
    }
}

let UserProfile = {

    initialize: function (init) {
        this.signIn = init.signIn
        this.queryPATH = init.queryPATH
    },

    action: function (request) {
        switch (request.action) {
        
        case 'AUTHENTICATE_USER':
            this.authenticateUser(request.message)
            break
        }
    },

    authenticateUser: function (credentials) {
        if (credentials.username == '') {
            this.note.display('Missing information. Enter username.')
        }
        else if (credentials.password == '') {
            this.note.display('Missing information. Enter password.')
        }
        else { this.queryServer(this.queryPATH, credentials) }
    },

    store: function (result) {
        if (result.success) {
            sessionStorage.setItem('username', result.username)
            sessionStorage.setItem('forename', result.forename)
            sessionStorage.setItem('surname', result.surname)
            sessionStorage.setItem('group', result.group)
            sessionStorage.setItem('admin', result.admin)
            this.requestPage(result.path)
        } else {
            this.note.display('ERROR: Invalid credentials.')
        }
    },

    retrieve: function (key) {
        return sessionStorage.getItem(key)
    },

    requestPage: function (pathSTR) {
        window.open(pathSTR, '_self')
    },

    queryServer: function (pathSTR, cred) {
        let queryOBJ = {
            find: { user_TAG: cred.username, auth_STR: cred.password },
            sort: null
        }
        let ajaxOBJ = {
            method: 'GET', url: pathSTR,
            data: queryOBJ, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (resultOBJ) => {
            this.store(resultOBJ)
        })
        .fail( () => {
            this.note.display('ERROR: User Profile AJAX request failed!')
        })
    }
}
