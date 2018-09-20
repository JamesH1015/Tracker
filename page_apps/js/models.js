/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let Application = {

    initialize: function initialize (init) {
        this.win = init.win
    },

    start: function (func) { this.win.page.ready(func) }
}

let ProjectsList = {

    initialize: function (init) {
        this.win = init.win
        this.view = init.view
        this.query = init.query
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

    store: function (items) {
        this.projects = items
        this.win.select.render(this.view, this.projects)
    },

    queryServer: function () {
        let query = { find: null, sort: { proj_TAG: 1 } }
        let ajaxOBJ = {
            method: 'GET', url: this.query.path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (results) => {
            if (results != null) { this.store(results) }
            else {
                this.win.message.display('ERROR: Projects not found.')
            }
        })
        .fail( () => {
            this.win.message.display('ERROR: Projects List AJAX request failed!')
        })
    }
}

let ViewsList = {

    initialize: function (init) {
        this.win = init.win
        this.query = init.query
        this.viewIDX = 0
    },

    action: function (request) {
        switch (request.action) {

        case 'QUERY_VIEWS_LIST':
            this.queryServer()
            break

        case 'RETRIEVE_SELECTED_VIEW':
            return this.views[this.viewIDX]

        case 'DISPLAY_SELECTED_VIEW':
            this.viewIDX = request.message
            break
        }
    },

    store: function (items) {
        this.views = items
        this.win.select.render(this.views)
    },

    queryServer: function () {
        let query = { find: null }
        let ajaxOBJ = {
            method: 'GET', url: this.query.path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (results) => {
            if (results != null) { this.store(results) }
            else {
                this.win.message.display('ERROR: Views not found.')
            }
        })
        .fail( () => {
            this.win.message.display('ERROR: Views List AJAX request failed!')
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

        case 'RETRIEVE_ALL_NODE_ITEMS':
            return this.retrieveAllItems(request.message)
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

    retrieveAllItems: function (nodeID) {
        let items = this.ancestors[nodeID].leafs

    //  Create new array instead of reference or shallow copy
        let blankARY = []
        let nodes = blankARY.concat(this.ancestors[nodeID].nodes)

        while (nodes.length > 0) {
            let nextNode = nodes.pop()
            let nextNodeID = nextNode[this.idKEY]
            let newItems = items.concat(this.ancestors[nextNodeID].leafs)
            let newNodes = nodes.concat(this.ancestors[nextNodeID].nodes)
            items = newItems
            nodes = newNodes
        }
        return items
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
        this.settings = init.settings
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
        this.win = init.win
        this.queryPATH = init.queryPATH
        this.currNodeID = ''
        this.prevNodeID = ''
        this.filter = {}
        this.colors = {}
    },

    action: function (request) {
        switch (request.action) {

        case 'QUERY_COLORS':
            let schemaName = UserProfile.action({
                action: 'RETRIEVE_SETTING',
                message: 'colorsSchema'
            })
            this.queryServer(schemaName)
            break

        case 'DISPLAY_SELECTED_NODE_ITEMS':
            this.store(request.message)
            break

        case 'DISPLAY_SELECTED_VIEW':
            this.displayView(this.items)
            break

        case 'DISPLAY_FILTERED_ITEMS':
            this.filter = request.message
            this.displayFilter(this.items)
            break

        case 'STORE_FILTER_INPUTS':
            this.filterBlank = request.message
            this.filter = request.message
            break

        case 'CLEAR_FILTER':
            this.filter = this.filterBlank
            this.displayFilter(this.items)
            break

        case 'CHANGE_SETTING':
            let key = request.message.key
            if (key == 'highlightRows') { this.displayView(this.items) }
            if (key == 'showAll') { this.store(this.currNodeID) }
            break
        }
    },

    store: function (nodeID) {
        let copyNodeID = this.currNodeID
        this.prevNodeID = copyNodeID
        this.currNodeID = nodeID

        if (this.prevNodeID != '') {
            this.win.grid.highlightNode(this.prevNodeID, 'off')
        }
        this.win.grid.highlightNode(nodeID, 'on')

        let retrieveAll = UserProfile.action({
            action: 'RETRIEVE_SETTING',
            message: 'itemsAll'
        })
        if (retrieveAll) {
            this.items = ProjectItems.action({
                action: 'RETRIEVE_ALL_NODE_ITEMS',
                message: nodeID
            })
        } else {
            this.items = ProjectItems.action({
                action: 'RETRIEVE_NODE_ITEMS_BY_TYPE',
                message: { id: nodeID, type: 'leafs' }
            })
        }

        this.displayView(this.items)
    },

    storeColors: function (schema) {
        this.colors = {
            active: null,
            key: 'status_STR',
            schema: schema
        }
    },

    displayView: function(items) {
        this.updateSettings()
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        this.win.grid.renderHead(view)
        this.win.grid.renderBody(view, items, this.filter, this.colors)
    },

    displayFilter: function (items) {
        this.updateSettings()
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        this.win.grid.renderBody(view, items, this.filter, this.colors)
    },

    updateSettings: function () {
        let colorsActive = UserProfile.action({
            action: 'RETRIEVE_SETTING',
            message: 'colorsActive'
        })

        this.colors.active = colorsActive
    },

    queryServer: function (schemaName) {
        let query = { find: { schema: schemaName } }
        let ajaxOBJ = {
            method: 'GET', url: this.queryPATH,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (results) => {
            if (results != null) { this.storeColors(results) }
            else {
                this.win.message.display('ERROR: Colors not found.')
            }
        })
        .fail( () => {
            this.win.message.display('ERROR: Colors List AJAX request failed!')
        })
    }
}

let UserProfile = {

    initialize: function (init) {
        this.win = init.win
        this.query = init.query
        this.view = init.view
    },

    action: function (request) {
        switch (request.action) {

        case 'AUTHENTICATE_USER':
            this.authenticateUser(request.message)
            break

        case 'LOAD_PROFILE':
            this.load()
            break

        case 'CHANGE_SETTING':
            let key = request.message.key
            let value = request.message.value
            for (setting in this.view) {
                let name = this.view[setting].name
                if (name == key) { this.profile.set[setting] = value }
            }

        case 'RETRIEVE_SETTING':
            return this.profile.set[request.message]
        }
    },

    authenticateUser: function (credentials) {
        if (credentials.username == '') {
            this.win.message.display('Missing information. Enter username.')
        }
        else if (credentials.password == '') {
            this.win.message.display('Missing information. Enter password.')
        }
        else { this.queryServer(credentials) }
    },

    store: function (result) {
        if (result.success) {
            sessionStorage.setItem('username', result.username)
            sessionStorage.setItem('forename', result.forename)
            sessionStorage.setItem('surname', result.surname)
            sessionStorage.setItem('group', result.group)
            sessionStorage.setItem('colorsActive', result.profile.colorsActive)
            sessionStorage.setItem('colorsSchema', result.profile.colorsSchema)
            sessionStorage.setItem('itemsAll', result.profile.itemsAll)
            sessionStorage.setItem('admin', result.admin)
            this.requestPage(result.path)
        } else {
            this.win.message.display('ERROR: Invalid credentials.')
        }
    },

    load: function () {
        this.profile = {
            bio: {
                username: this.retrieve('username'),
                forename: this.retrieve('forename'),
                surname: this.retrieve('surname'),
                group: this.retrieve('group'),
                admin: this.retrieve('admin'),
            },
            set: {
                colorsActive:this.retrieve('colorsActive'),
                colorsSchema: this.retrieve('colorsSchema'),
                itemsAll: this.retrieve('itemsAll')
            }
        }
        this.initializeIcon(this.profile.set)
    },

    retrieve: function (prop) {
        let value = sessionStorage.getItem(prop)
        if (value == 'true') { value = true }
        if (value == 'false') { value = false }
        return value
    },

    initializeIcon: function (settings) {
        for (key in settings) {
            if (this.view[key].type == 'checkbox') {
                this.win.icon.initCheckbox(this.view[key].name, settings[key])
            }
            if (this.view[key].type == 'select') {
                let items = [settings[key]]
                this.win.icon.initSelect(this.view[key].name, items)
            }
        }
    },

    requestPage: function (path) {
        this.win.page.open(path, '_self')
    },

    queryServer: function (cred) {
        let query = {
            find: { user_TAG: cred.username, auth_STR: cred.password },
            sort: null
        }
        let ajaxOBJ = {
            method: 'GET', url: this.query.path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (result) => { this.store(result) })
        .fail( () => {
            this.win.message.display('ERROR: User Profile AJAX request failed!')
        })
    }
}
