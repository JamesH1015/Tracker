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
        this.component = init.component
        this.queryPATH = init.queryPATH
        this.note = init.note
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

    store: function (projectsARY) {
        this.projects = projectsARY
        this.component.render(this.projects)
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
        this.component = init.component
        this.viewIDX = init.viewIDX
        this.queryPATH = init.queryPATH
        this.note = init.note
    },

    action: function (request) {
        switch (request.action) {

        case 'QUERY_VIEWS_LIST':
            this.queryServer(this.queryPATH)
            break

        case 'RETRIEVE_SELECTED_VIEW':
            return this.views[this.viewIDX]

        case 'DISPLAY_SELECTED_VIEW':
            this.viewIDX = request.message
            break
        }
    },

    store: function (viewsARY) {
        this.views = viewsARY
        this.component.render(this.views)
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

    initialize: function (init) {
        this.queryPATH = init.queryPATH
        this.note = init.note
        this.idKEY = init.idKEY
        this.parentKEY = init.parentKEY
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
            let ancestorID = items[idx][this.parentKEY]
            if (!(ancestorID in this.ancestors)) {
                if ((ancestorID != null) && (ancestorID != '')) {
                    this.ancestors[ancestorID] = { nodes: [], leafs: [] }
                } else {
                    this.rootITEM = items[idx]
                    let itemID = items[idx][this.idKEY]
                    this.ancestors[itemID] = { nodes: [], leafs: [] }
                }
            }
            idx++
        }
    //  Sort the children of an ancestor into 'nodes' and 'leafs'
    //  and push them into arrays mapped to the ancestor
        let idy = 0
        while (idy < itemsLEN) {
            let itemID = items[idy][this.idKEY]
            let ancestorID = items[idy][this.parentKEY]
            if (itemID in this.ancestors) {
                if ((ancestorID != null) && (ancestorID != '')) {
                    this.ancestors[ancestorID].nodes.push(items[idy])
                }
            } else{
                this.ancestors[ancestorID].leafs.push(items[idy])
            }
            idy++
        }

        Dispatch({
            action: 'DISPLAY_ROOT_ITEMS',
            message: this.rootITEM
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

    initialize: function (init) {
        this.component = init.component
        this.note = init.note
        this.view = init.view
    },

    action: function (request) {
        switch (request.action) {

        case 'DISPLAY_ROOT_ITEMS':
            this.store(request.message)
            break
        
        case 'DISPLAY_SELECTED_NODE_ITEMS':
            this.updateRecent(request.message)
            break
        }
    },

    store: function (rootITEM) {

        this.rootID = rootITEM[this.view.id]
        this.nodes = {}
        this.nodes[this.rootID] = { active: true, level: 0 }

        this.displayRoot(rootITEM)
    },

    displayRoot: function (root) {

        this.old = { id: null, level: null}
        this.now = { id: root[this.view.id], level: 0 }

        this.component.renderRoot(this.view, root)

        Parts.action({
            action: 'DISPLAY_SELECTED_NODE_ITEMS',
            message: root[this.view.id]
        })

        this.displayNodes(this.now.id, this.now.level)
    },

    updateRecent: function (nodeID) {

        this.old.id = this.now.id
        this.old.level = this.now.level
        this.now.id = nodeID
        this.now.level = this.nodes[nodeID].level
        
        if (this.now.level > this.old.level) {
            this.displayNodes(this.now.id, this.now.level)
            this.nodes[this.now.id].active = true
        }

        if ((this.now.level <= this.old.level) && (this.now.level != 0)) {
            this.closeNodes(this.now.level)

            this.displayNodes(this.now.id, this.now.level)
            this.nodes[this.now.id].active = true
        }

        if (this.now.level == 0) { this.closeNodes(1) }
    },

    displayNodes: function (nodeID, nodeLevel) {

        let items = ProjectItems.action({
            action: 'RETRIEVE_NODE_ITEMS_BY_TYPE',
            message: { id: nodeID, type: 'nodes' }
        })

        if (items.length > 0) {

            let subLevel = nodeLevel + 1

            for (let idx = 0; idx < items.length; idx++) {
                let itemID = items[idx][this.view.id]
                this.nodes[itemID] = { active: false, level: subLevel }
            }

            this.component.toggleArrows(nodeID, 'open')
            this.component.renderNodes(nodeID, this.view, items, subLevel)
        }
    },

    closeNodes: function (nodeLevel) {
        let minLevel = 2
        if (nodeLevel != 0) { minLevel = nodeLevel + 1 }
        
        for (key in this.nodes) {
            let level = this.nodes[key].level
            if (level >= minLevel) {
                this.component.removeNode(key)
                this.nodes.active = false
                this.nodes[key].level = -1
            }
            let active = this.nodes[key].active
            if ((level = nodeLevel) && (active)) {
                this.component.toggleArrows(key, 'close')
                this.nodes[key].active = false
            }
        }
    }
}

let Parts = {

    initialize: function (init) {
        this.component = init.component
        this.currNodeID = ''
        this.prevNodeID = ''
    },

    action: function (request) {
        switch (request.action) {

        case 'DISPLAY_SELECTED_NODE_ITEMS':
            this.store(request.message)
            break
        }
    },

    store: function (nodeID) {
        let copyNodeID = this.currNodeID
        this.prevNodeID = copyNodeID
        this.currNodeID = nodeID

        if (this.prevNodeID != '') {
            this.component.highlightNode(this.prevNodeID, 'off')
        }
        this.component.highlightNode(nodeID, 'on')

        this.items = ProjectItems.action({
            action: 'RETRIEVE_NODE_ITEMS_BY_TYPE',
            message: { id: nodeID, type: 'leafs' }
        })

        this.display(this.items)
    },

    display: function(items) {
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        this.component.render(view, items)
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
