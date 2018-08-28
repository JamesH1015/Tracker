/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let Dispatch = function (request) {
    ProjectsList.action(request)
    ProjectItems.action(request)
    SideBar.action(request)
    Grid.action(request)
    UserProfile.action(request)
}

let ProjectsList = {

    list: [],

    action: function (request) {
        switch (request.action) {
        
        case 'QUERY_PROJECTS_LIST':
            this.query()
            break
        }
    },

    store: function (ajaxList) {
        this.list = ajaxList
    }
}

let ProjectItems = {

    ancestors: {}, rootItem: '',

    action: function (request) {
        switch (request.action) {
        
        case 'QUERY_PROJECT_DATA':
            this.query(request.message)
            break
        
        case 'RETRIEVE_PROJECT_DATA_BY_ANCESTOR':
            return this.retrieve(request.message)
        }
    },

    store: function (items) {
        let itemsLen = items.length
    //  Hash ancestors as keys into an object
    //  and create 'nodes' and 'leafs' arrays for each ancestor
        let idx = 0
        while (idx < itemsLen) {
            let itemAncestor = items[idx]['parent_ID']
            if (!(itemAncestor in this.ancestors)) {
                if ((itemAncestor != null) && (itemAncestor != '')) {
                    this.ancestors[itemAncestor] = { nodes: [], leafs: [] }
                } else {
                    this.rootItem = items[idx]
                }
            }
            idx++
        }
    //  Sort the chidlren of an ancestor into 'nodes' and 'leafs'
    //  and push them into arrays mapped to the ancestor
        let idy = 0
        while (idy < itemsLen) {
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
    },

    retrieve: function (param) {
        return this.ancestors[param.id][param.type]
    }
}

let SideBar = {

    nodes: {}, recent: [], previous: { node: '', level: null },

    action: function (request) {
        switch (request.action) {

        case 'INITIALIZE_SIDEBAR':
            this.initialize(request.message)
            break
        
        case 'DISPLAY_SELECTED_NODE_DATA':
            this.displaySelected(request.message)
            break
        }
    },

    store: function (nodeList) {
        for (let idx = 0; idx < nodeList.length; idx++) {
            this.nodes[nodeList[idx]] = {
                state: null, level: null, parents: []
            }
        }
    },

    updateState: function (subnodes, state, level) {
        for (let idx = 0; idx < subnodes.length; idx++) {
            let nodeID = subnodes[idx]['_id']
            this.nodes[nodeID].state = state
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

let Grid = {

    action: function (request) {
        switch (request.action) {

        case 'DISPLAY_GRID_ITEMS':
            this.display(request.message)
            break
        }
    }
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

let Utilities = {
    queryServer: function (query, path, response, error) {
        let ajaxOBJ = {
            method: 'GET', url: path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (result) => { response(result) })
        .fail( () => { error() })
    }
}
