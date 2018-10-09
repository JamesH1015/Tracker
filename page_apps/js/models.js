/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let Application = {

    initialize: function initialize (init) {
        this.win = init.win
        this.ready = init.ready
        this.run = init.run
    },

    start: function (func) { this.win.page.ready(func) },

    action: function (request) {
        switch (request.action) {

        case 'READY':
            let com = request.message
            this.ready[com] = true

            let readyComplete = true
            for (key in this.ready) {
                if (!this.ready[key]) { readyComplete = false }
            }
            if (readyComplete) { this.run() }
            break

        case 'APP_RESET':
            Parts.action({
                action: 'RESET',
                message: { filter: false }
            })
            PartsEditor.action({
                action: 'RESET',
                message: { insert: false, more: false }
            })
            Assemblies.action({
                action: 'RESET',
                message: null
            })
            ProjectItems.action({
                action: 'RESET',
                message: null
            })
            ProjectsList.action({
                action: 'RESET',
                mesage: null
            })
            break
        }
    }
}

let ProjectsList = {

    initialize: function (init) {
        this.win = init.win
        this.view = init.view
        this.query = init.query
        this.projects = []
        this.info = {}
        this.project = {}
    },

    action: function (request) {
        switch (request.action) {

        case 'QUERY_PROJECTS_LIST':
            this.queryServer()
            break

        case 'DISPLAY_SELECTED_PROJECT':
            let val = request.message
            if (val == 'null') { this.queryProjects() }
            else { this.loadProject(val) }
            break

        case 'CHANGE_SETTING':
            let key = request.message.key
            if (key == 'projectsAll') {
                this.win.select.clear()
                this.displayProjects()
            }
            break

        case 'RETRIEVE_PROJECT':
            return this.project

        case 'RETRIEVE_PROJECT_INFO':
            let projID = request.message
            return {
                id: projID,
                name: this.info[projID][this.view.name],
                desc: this.info[projID][this.view.desc]
            }

        case 'RESET':
            this.win.select.set('null')
            break
        }
    },

    store: function (items) {
        this.projects = items
        this.displayProjects()

        for (let idx = 0; idx < items.length; idx++) {
            let projID = items[idx][this.view.id]
            this.info[projID] = this.projects[idx]
        }

        Application.action({
            action: 'READY',
            message: 'ProjectsList'
        })
    },

    displayProjects: function () {
        let showAll = UserProfile.action({
            action: 'RETRIEVE_SETTING',
            message: 'projectsAll'
        })
        let showProjects = []
        if (!showAll) {
            for (let idx = 0; idx < this.projects.length; idx++) {
                if (this.projects[idx].active_BOL) {
                    showProjects.push(this.projects[idx])
                }
            }
        } else { showProjects = this.projects }
        this.win.select.render(this.view, showProjects)
    },

    queryProjects: function () {
        Parts.action({
            action: 'RESET',
            message: { filter: false }
        })
        PartsEditor.action({
            action: 'RESET',
            message: { insert: false }
        })
        Assemblies.action({
            action: 'RESET',
            message: null
        })
        ProjectItems.action({
            action: 'RESET',
            message: null
        })
    },

    loadProject: function (val) {
        this.project.id = val
        this.project.info = this.info[val]

        ProjectItems.action({
            action: 'QUERY_PROJECT_DATA',
            message: this.project.id
        })
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
        Application.action({
            action: 'READY',
            message: 'ViewsList'
        })
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

let ProjectsQuery = {

    initialize: function (init) {
        this.win = init.win
        this.query = init.query
        this.view = init.view
    },

    action: function (request) {
        switch (request.action) {

        case 'RETRIEVE_PROJECT_ITEMS':
            return this.projects[request.message]

        case 'RETRIEVE_ALL_PROJECT_ITEMS':
            return this.items

        case 'QUERY_PROJECTS':
            let inputs = request.message
            let find = {}
            for (key in inputs) {
                if (inputs[key] != '') { find[key] = inputs[key] }
            }
            this.queryServer(find)
            break
        }
    },

    store: function (items) {
        this.items = items
        this.projects = {}
        let itemsLEN = items.length
        let idx = 0
        while (idx < itemsLEN) {
            let projID = items[idx][this.view.projID]
            if (projID != '') {
                if (!(projID in this.projects)) {
                    this.projects[projID] = [items[idx]]
                } else {
                    this.projects[projID].push(items[idx])
                }
            }
            idx++
        }
        this.displayProjects()
    },

    displayProjects: function () {
        this.win.sidebar.renderItem({
            id: 'show-all',
            name: 'Find Results',
            desc: 'Display all items'
        })
        Parts.action({
            action: 'DISPLAY_SELECTED_PROJECT_ITEMS',
            message: 'show-all'
        })

        for (key in this.projects) {
            let info = ProjectsList.action({
                action: 'RETRIEVE_PROJECT_INFO',
                message: key
            })
            this.win.sidebar.renderItem(info)
        }
    },

    queryServer: function (find) {
        let query = { find: find, sort: null }
        let ajaxOBJ = {
            method: 'GET', url: this.query.path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (results) => {
            if (results != null) { this.store(results) }
            else {
                this.win.message.display('ERROR: Project Items not found.')
            }
        })
        .fail( () => {
            this.win.message.display('ERROR: Project Items AJAX request failed!')
        })
    }
}

let ProjectItems = {

    initialize: function (init) {
        this.win = init.win
        this.query = init.query
        this.view = init.view
    },

    action: function (request) {
        switch (request.action) {

        case 'QUERY_PROJECT_DATA':
            this.queryServer(request.message)
            break

        case 'RETRIEVE_NODE_ITEMS_BY_TYPE':
            let id = request.message.id
            let type = request.message.type
            return this.ancestors[id][type]

        case 'RETRIEVE_ALL_NODE_ITEMS':
            return this.retrieveAllItems(request.message)

        case 'UPDATE_NODE_LEAFS':
            this.updateNodeLeafs(request.message)
            break

        case 'INSERT_NODE_LEAFS':
            this.insertNodeLeafs(request.message)
            break

        case 'INSERT_NEW_NODE':
            this.insertNewNode(request.message)
            break

        case 'RESET':
            this.ancestors = {}
            break
        }
    },

    store: function (items) {
        this.ancestors = {}
        let itemsLEN = items.length
    //  Hash ancestors as keys into an object
    //  and create 'nodes' and 'leafs' arrays for each ancestor
        let idx = 0
        while (idx < itemsLEN) {
            let ancestorID = items[idx][this.view.parent]
            let itemID = items[idx][this.view.id]
            let itemType = items[idx][this.view.type]
            if (!(ancestorID in this.ancestors)) {
                if ((ancestorID != null) && (ancestorID != '')) {
                    this.ancestors[ancestorID] = { nodes: [], leafs: [] }
                } else {
                    this.rootITEM = items[idx]
                    this.ancestors[itemID] = { nodes: [], leafs: [] }
                }
            }
            if (itemType == 'assembly') {
                this.ancestors[itemID] = { nodes: [], leafs: [] }
            }
            idx++
        }
    //  Sort the children of an ancestor into 'nodes' and 'leafs'
    //  and push them into arrays mapped to the ancestor
        let idy = 0
        while (idy < itemsLEN) {
            let itemID = items[idy][this.view.id]
            let ancestorID = items[idy][this.view.parent]
            if (itemID in this.ancestors) {
                if ((ancestorID != null) && (ancestorID != '')) {
                    this.ancestors[ancestorID].nodes.push(items[idy])
                }
            } else {
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

    queryServer: function (projectID) {
        let query = { find: { proj_ID: projectID }, sort: null }
        let ajaxOBJ = {
            method: 'GET', url: this.query.path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (results) => {
            if (results != null) { this.store(results) }
            else {
                this.win.message.display('ERROR: Project Items not found.')
            }
        })
        .fail( () => {
            this.win.message.display('ERROR: Project Items AJAX request failed!')
        })
    },

    updateNodeLeafs: function (updates) {
        let parent = Assemblies.action({
            action: 'RETRIEVE_PARENT',
            message:  null
        })
        for (let idx = 0; idx < updates.length; idx++) {
            let id = updates[idx][this.view.id]
            let set = updates[idx].set
            let leafs = this.ancestors[parent.id].leafs
            for (let idy = 0; idy < leafs.length; idy++) {
                if (leafs[idy][this.view.id] == id) {
                    for (key in set) {
                        this.ancestors[parent.id].leafs[idy][key] = set[key]
                    }
                }
            }
        }
        Parts.action({
            action: 'DISPLAY_SELECTED_NODE_ITEMS',
            message: parent.id
        })
    },

    insertNodeLeafs: function (inserts) {
        let parent = Assemblies.action({
            action: 'RETRIEVE_PARENT',
            message:  null
        })
        for (let idx = 0; idx < inserts.length; idx++) {
            this.ancestors[parent.id].leafs.push(inserts[idx])
        }
        Parts.action({
            action: 'DISPLAY_SELECTED_NODE_ITEMS',
            message: parent.id
        })
    },

    insertNewNode: function (node) {
        let nodeID = node[this.view.id]
        let parentID = node[this.view.parent]

        this.ancestors[nodeID] = { nodes: [], leafs: [] }
        this.ancestors[parentID].nodes.push(node)
    }
}

let Assemblies = {

    initialize: function (init) {
        this.win = init.win
        this.view = init.view
        this.query = init.query
    },

    action: function (request) {
        switch (request.action) {

        case 'DISPLAY_ROOT_ITEMS':
            this.store(request.message)
            break

        case 'DISPLAY_SELECTED_NODE_ITEMS':
            this.updateRecent(request.message)
            this.win.add.displaySelected(this.nodes[this.now.id].name)
            ImportParts.action({
                action: 'DISPLAY_SELECT_NODE_IN_MODAL',
                message: this.nodes[this.now.id].name
            })
            break

        case 'RETRIEVE_PARENT':
            let id = this.now.id
            let name = this.nodes[id].name
            return { id: id, name: name }

        case 'ADD_NEW_ASSEMBLY':
            this.addAssembly(request.message.name, request.message.desc)
            break

        case 'RESET':
            this.rootID = null
            this.nodes = {}
            this.old = { id: null, level: null }
            this.now = { id: null, level: null }
            this.win.sidebar.clearNodes()
            break
        }
    },

    store: function (rootITEM) {

        this.rootID = rootITEM[this.view.id]
        let rootName = rootITEM[this.view.name]

        this.nodes = {}
        this.nodes[this.rootID] = { name: rootName, active: true, level: 0 }

        this.displayRoot(rootITEM)
        this.win.add.displaySelected(rootName)
        ImportParts.action({
            action: 'DISPLAY_SELECT_NODE_IN_MODAL',
            message: this.nodes[this.now.id].name
        })
    },

    displayRoot: function (root) {

        this.old = { id: null, level: null }
        this.now = { id: root[this.view.id], level: 0 }

        this.win.sidebar.renderRoot(this.view, root)

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
                let itemName = items[idx][this.view.name]
                this.nodes[itemID] = { name: itemName, active: false, level: subLevel }
            }

            this.win.sidebar.toggleArrows(nodeID, 'open')
            this.win.sidebar.renderNodes(nodeID, this.view, items, subLevel)
        }
    },

    closeNodes: function (nodeLevel) {
        let minLevel = 2
        if (nodeLevel != 0) { minLevel = nodeLevel + 1 }

        for (key in this.nodes) {
            let level = this.nodes[key].level
            if (level >= minLevel) {
                this.win.sidebar.removeNode(key)
                this.nodes.active = false
                this.nodes[key].level = -1
            }
            let active = this.nodes[key].active
            if ((level = nodeLevel) && (active)) {
                this.win.sidebar.toggleArrows(key, 'close')
                this.nodes[key].active = false
            }
        }
    },

    addAssembly: function (name, desc) {
        let parentID = this.now.id
        let parentName = this.nodes[parentID].name

        let project = ProjectsList.action({
            action: 'RETRIEVE_PROJECT',
            message: null
        })

        let inserts = [{
            proj_ID: project.id,
            proj_TAG: project.info.proj_TAG,
            parent_ID: parentID,
            parent_TAG: parentName,
            part_TAG: name,
            dscr_STR: desc,
            type_STR: 'assembly'
        }]
        this.queryServer(inserts)
    },

    queryServer: function (inserts) {
        let query = { insert: inserts }
        let ajaxOBJ = {
            method: 'POST', url: this.query.path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (result) => {
            if (result != null) { this.insertProjectItems(result) }
            else {
                this.win.message.display('ERROR: Assembly Insert failed.')
            }
        })
        .fail( () => {
            this.win.message.display('ERROR: Assembly AJAX request failed!')
        })
    },

    insertProjectItems: function (result) {
        if (result.inserted) {
            ProjectItems.action({
                action: 'INSERT_NEW_NODE',
                message: result.items[0]
            })
            this.insertNode(result.items[0])
        } else {
            this.win.message.display('ERROR: Add Assembly save failed!')
        }
    },

    insertNode: function (node) {
        let nodeID = node[this.view.id]
        let subLevel = this.now.level + 1
        let parentID = node[this.view.parent]
        this.nodes[nodeID] = {
            name: node[this.view.name],
            active: false,
            level: subLevel
        }
        this.win.sidebar.renderNode(parentID, this.view, node, subLevel)
    }
}

let Parts = {

    initialize: function (init) {
        this.win = init.win
        this.query = init.query

        this.currNodeID = ''
        this.prevNodeID = ''
        this.filter = {}
        this.colors = {}
        this.blankRowIndex = 0
        this.items = []
        this.filterActive = false
    },

    action: function (request) {
        switch (request.action) {

        case 'QUERY_COLORS':
            let schemaName = UserProfile.action({
                action: 'RETRIEVE_SETTING',
                message: 'colorsSchema'
            })
            this.queryServer(schemaName)
            Application.action({
                action: 'READY',
                message: 'Parts'
            })
            break

        case 'DISPLAY_SELECTED_NODE_ITEMS':
            this.filterActive = true
            this.displayNodeState(request.message)
            this.storeNodeItems(request.message)
            this.win.grid.disableFind()
            PartsEditor.action({
                action: 'RESET',
                message: { insert: true, more: true }
            })
            break

        case 'DISPLAY_SELECTED_PROJECT_ITEMS':
            this.filterActive = true
            this.displayNodeState(request.message)
            this.storeProjectItems(request.message)
            this.win.grid.disableFind()
            break

        case 'DISPLAY_SELECTED_VIEW':
            this.displayView(this.items)
            break

        case 'APPEND_NEW_ITEMS':
            this.appendNewItems(request.message)
            break

        case 'DISPLAY_FILTERED_ITEMS':
            this.filter = request.message
            this.displayFilter(this.items)
            break

        case 'STORE_FILTER_INPUTS':
            this.filter = request.message
            break

        case 'CLEAR_FILTER':
            this.filter = {}
            this.displayFilter(this.items)
            break

        case 'CHANGE_SETTING':
            let key = request.message.key
            if (key == 'highlightRows') { this.displayView(this.items) }
            if (key == 'showAll') { this.store(this.currNodeID) }
            break

        case 'INSERT_BLANK_ROW':
            this.insertBlankRow()
            break

        case 'RESET':
            this.filterActive = request.message.filter
            this.items = []
            this.currNodeID = ''
            this.prevNodeID = ''
            this.filter = {}
            this.blankRowIndex = 0

            let view = ViewsList.action({
                action: 'RETRIEVE_SELECTED_VIEW',
                message: null
            })
            this.win.grid.renderHead(view, this.filterActive)
            this.win.grid.clearBody()
            this.win.grid.enableFind()
            break
        }
    },

    displayNodeState: function (id) {
        let copyNodeID = this.currNodeID
        this.prevNodeID = copyNodeID
        this.currNodeID = id

        if (this.prevNodeID != '') {
            this.win.grid.highlightNode(this.prevNodeID, 'off')
        }
        this.win.grid.highlightNode(id, 'on')
    },

    storeNodeItems: function (nodeID) {
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

    storeProjectItems: function (projID) {
        if (projID == 'show-all') {
            this.items = ProjectsQuery.action({
                action: 'RETRIEVE_ALL_PROJECT_ITEMS',
                message: null
            })
        } else {
            this.items = ProjectsQuery.action({
                action: 'RETRIEVE_PROJECT_ITEMS',
                message: projID
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
        this.win.grid.renderHead(view, this.filterActive)
        this.win.grid.renderBody(view, items, this.filter, this.colors, false)
    },

    displayFilter: function (items) {
        this.updateSettings()
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        this.win.grid.renderBody(view, items, this.filter, this.colors, false)
    },

    appendNewItems: function (items) {
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        for (let idx = 0; idx < items.length; idx++) {
            items[idx]['_id'] = `new-${this.blankRowIndex}`
            this.blankRowIndex = this.blankRowIndex + 1
        }
        this.win.grid.renderBody(view, items, this.filter, this.colors, true)
        PartsEditor.action({
            action: 'STORE_NEW_ITEMS',
            message: items
        })
    },

    insertBlankRow: function () {
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        this.win.grid.insert(view, this.blankRowIndex)
        this.blankRowIndex = this.blankRowIndex + 1
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
            method: 'GET', url: this.query.path,
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

let PartsEditor = {

    initialize: function (init) {
        this.win = init.win
        this.query = init.query

        this.edits = []
        this.newItems = []
        this.errors = []
        this.active = false
        this.rules = {}
    },

    action: function (request) {
        switch (request.action) {

        case 'STORE_EDIT':
            this.edits.push(request.message)
            this.active = true
            break

        case 'STORE_NEW_ITEMS':
            this.storeNewItems(request.message)

        case 'STORE_ERROR':
            this.errors.push(request.message)
            break

        case 'SAVE_EDITS':
            this.saveEdits(this.edits)
            break

        case 'DISABLE_INSERT':
            this.win.edit.disableInsert()
            break

        case 'DISPLAY_SELECTED_VIEW':
            this.setRules()
            break

        case 'APPLY_RULE':
            this.applyRule(request.message.id, request.message.field, this.edits)
            break

        case 'RESET':
            this.insertActive = request.message.insert
            if (this.insertActive) { this.win.edit.enableInsert() }
            else { this.win.edit.disableInsert() }
            if (request.message.more) { this.win.edit.enableMore() }
            else { this.win.edit.disableMore() }
            this.edits = []
            this.errors = []
            this.updates = []
            this.inserts = []
            this.newItems = []
            this.setRules()
            break
        }
    },

    storeNewItems: function (items) {
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        let tform = {}
        for (let idx = 0; idx < view.columns.length; idx++) {
            tform[view.columns[idx].field] = view.columns[idx].dtype
        }
        let project = ProjectsList.action({
                action: 'RETRIEVE_PROJECT',
                message: null
            })

        let parent = Assemblies.action({
                action: 'RETRIEVE_PARENT',
                message:  null
            })
        for (let idy = 0; idy < items.length; idy++) {
            let id = items[idy]._id
            let newItem = {}
            for (key in items[idy]) {
                if (key != '_id') {
                    let field = key
                    let data = items[idy][key]
                    let type = tform[key]
                    let test = this.win.edit.testNew(id, field, data, type)
                    if (test.valid) {
                        newItem[field] = test.value
                    }
                }
            }
            newItem.proj_ID = project.id
            newItem.proj_TAG = project.info.proj_TAG
            newItem.parent_ID = parent.id
            newItem.parent_TAG = parent.name
            this.newItems.push(newItem)
            this.active = true
            this.win.edit.enableSave()
        }
    },

    saveEdits: function (edits) {
        this.updates = []
        this.inserts = []
        for (let idx = 0; idx < edits.length; idx++) {
            let id = edits[idx].id
            let field = edits[idx].field
            let value = edits[idx].value
            let type = edits[idx].type
            let text = edits[idx].text
            let idARY = id.split('-')
            if (idARY[0] == 'insert') {
                let idno = idARY[1]
                if (typeof this.inserts[idno] === 'undefined') {
                    this.inserts[idno] = {}
                }
                this.inserts[idno][field] = value
            } else {
                let updateItem = { _id: id, set: {} }
                updateItem.set[field] = value
                this.updates.push(updateItem)
            }
        }

        if (this.inserts.length > 0) {
            let project = ProjectsList.action({
                    action: 'RETRIEVE_PROJECT',
                    message: null
                })

            let parent = Assemblies.action({
                    action: 'RETRIEVE_PARENT',
                    message:  null
                })
            let insertItems = []
            for (let idx = 0; idx < this.inserts.length; idx++) {
                let item = {}
                if (typeof this.inserts[idx] != 'undefined') {
                    item = this.inserts[idx]
                    item.proj_ID = project.id
                    item.proj_TAG = project.info.proj_TAG
                    item.parent_ID = parent.id
                    item.parent_TAG = parent.name
                }
                insertItems.push(item)
            }
            this.insertServer(insertItems)
        }

        if (this.newItems.length > 0) { this.insertServer(this.newItems) }

        if (this.updates.length > 0) { this.updateServer(this.updates) }

        this.edits = []
        this.errors = []
        this.active = false
    },

    updateServer: function (updates) {
        let query = { update: updates }
        let ajaxOBJ = {
            method: 'PUT', url: this.query.path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (result) => {
            if (result != null) { this.updateProjectItems(result) }
            else {
                this.win.message.display('ERROR: Parts Editor Update failed.')
            }
        })
        .fail( () => {
            this.win.message.display('ERROR: Parts Editor AJAX request failed!')
        })
    },

    insertServer: function (inserts) {
        let query = { insert: inserts }
        let ajaxOBJ = {
            method: 'POST', url: this.query.path,
            data: query, dataType: 'json'
        }
        $.ajax(ajaxOBJ).done( (result) => {
            if (result != null) { this.insertProjectItems(result) }
            else {
                this.win.message.display('ERROR: Parts Editor Insert failed.')
            }
        })
        .fail( () => {
            this.win.message.display('ERROR: Parts Editor AJAX request failed!')
        })
    },

    updateProjectItems: function (result) {
        if (result.ok > 0) {
            ProjectItems.action({
                action: 'UPDATE_NODE_LEAFS',
                message: this.updates
            })
        }
        this.updates = []
    },

    insertProjectItems: function (result) {
        if (result.inserted) {
            ProjectItems.action({
                action: 'INSERT_NODE_LEAFS',
                message: result.items
            })
        } else {
            this.win.message.display('ERROR: Parts Editor save failed!')
        }
        this.inserts = []
    },

    setRules: function () {
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        this.rules = view.rules
    },

    applyRule: function (id, field, edits) {
        if (field in this.rules) {
            let rule = this.rules[field]
            let operands = [] //  this.rule[field].operands
            for (let idx = 0; idx < rule.operands.length; idx++) {
                for (let idy = 0; idy < this.edits.length; idy++) {
                    if ((edits[idy].field == rule.operands[idx])
                     && (edits[idy].id == id)) {
                        operands[idx] = edits[idy].value
                    }
                }
            }
            let func = new Function('ops', rule.function)
            let result = func(operands)
            this.win.edit.setValue(id, rule.result, result)
            this.edits.push({
                id: id,
                field: rule.result,
                value: result
            })
        }
    }
}

let ImportParts = {

    initialize: function (init) {
        this.win = init.win
    },

    action: function (request) {
        switch (request.action) {

        case 'DISPLAY_SELECT_NODE_IN_MODAL':
            this.win.file.displaySelected(request.message)
            break

        case 'LOAD_IMPORTED_ITEMS':
            this.viewTransform(request.message.data)
            break
        }
    },

    viewTransform: function (data) {
        let view = ViewsList.action({
            action: 'RETRIEVE_SELECTED_VIEW',
            message: null
        })
        let tform = {}
        for (let idx = 0; idx < view.columns.length; idx++) {
            tform[view.columns[idx].title] = view.columns[idx].field
        }
        let items = []
        for (let idy = 0; idy < data.length; idy++) {
            let item = {}
            for (key in data[idy]) {
                item[tform[key]] = data[idy][key]
            }
            items.push(item)
        }
        Parts.action({
            action: 'APPEND_NEW_ITEMS',
            message: items
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
            Application.action({
                action: 'READY',
                message: 'UserProfile'
            })
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
            sessionStorage.setItem('projectsAll', result.profile.projectsAll)
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
                itemsAll: this.retrieve('itemsAll'),
                projectsAll: this.retrieve('projectsAll')
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
