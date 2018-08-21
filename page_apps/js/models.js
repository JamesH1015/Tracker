/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let Dispatch = function (request) {
    ProjectsList.action(request)
    ProjectItems.action(request)
    UserProfile.action(request)
}

let ProjectsList = {

    list: [],

    action: function (request) {
        switch (request.action) {
        
        case 'RETRIEVE_PROJECTS_LIST':
            this.retrieve()
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
        
        case 'RETRIEVE_PROJECT_ITEMS':
            this.retrieve(request.message)
            break
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
