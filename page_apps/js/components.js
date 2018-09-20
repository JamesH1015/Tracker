/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let HTMLDoc = {

    ready: function (func) {
        $(document).ready(func)
    },

    open: function (path) {
        window.open(path, '_self')
    }
}

let ProjectSelect = {

    initialize: function (init) {
        this.selectID = init.selectID
    },

    render: function (view, items) {
        this.append(this.selectID, view, items)
        this.activate(this.selectID)
    },

    append: function (selectID, view, items) {
        for (let idx = 0; idx < items.length; idx++) {
            let id = items[idx][view.id]
            let name = items[idx][view.name]
            let desc = items[idx][view.desc]
            let option = `<option value="${id}">${name} ${desc}</option>`
            $(selectID).append(option)
        }
    },

    activate: function (selectID) {
        $(selectID).change( () => {
            let projID = $(`${selectID} option:selected`).attr('value')
            Dispatch({
                action: 'DISPLAY_SELECTED_PROJECT',
                message: projID
            })
        })
    }
}

let ViewSelect = {

    initialize: function (init) {
        this.selectID = init.selectID
    },

    render: function (items) {
        this.append(this.selectID, items)
        this.activate(this.selectID)
    },

    append: function (selectID, items) {
        for (let idx = 0; idx < items.length; idx++) {
            let name = items[idx].name
            let option = `<option value="${idx}">${name}</option>`
            $(selectID).append(option)
        }
    },

    activate: function (selectID) {
        $(selectID).change( () => {
            let viewIDX = $(`${selectID} option:selected`).attr('value')
            Dispatch({
                action: 'DISPLAY_SELECTED_VIEW',
                message: viewIDX
            })
        })
    }
}

let SideBarGroup = {

    initialize: function (init) {
        this.listID = init.listID
        this.circleIMG = init.circleIcon
        this.closedIMG = init.closedIcon
        this.expandIMG = init.expandIcon
        this.rootID = ''
    },

    renderRoot: function (view, root) {
        let id = root[view.id]
        let name = root[view.name]
        let desc = root[view.desc]

        this.rootID = root[view.id] // toggleArrows exclusion

        let html = `<button id="${id}" type="button"`
            + `class="node list-group-item list-group-item-action list-group-item-secondary">`
            + `<img src="${this.circleIMG}" class="float-left mt-3 mr-2">`
            + `<div class="text-truncate">${name}`
            + `<br>${desc}</div></button>`
        $(this.listID).append(html)
        $(`#${id}`).click( () => {
            Dispatch({
                action: 'DISPLAY_SELECTED_NODE_ITEMS',
                message: id
            })
        })
    },

    renderNodes: function (nodeID, view, nodes, level) {
        for (let idx = nodes.length - 1; idx > -1; idx--) {

            let id = nodes[idx][view.id]
            let name = nodes[idx][view.name]
            let desc = nodes[idx][view.desc]

        //  Insert node
            let html = `<button id="${id}" type="button"`
                + `class="node list-group-item list-group-item-action list-group-item-secondary">`
                + `<img src="${this.closedIMG}" class="float-left mt-3 mr-2">`
                + `<div class="text-truncate">${name}`
                + `<br>${desc}</div></button>`
            $(html).insertAfter(`#${nodeID}`)

        //  Insert level icons
            for (let idy = 0; idy < level - 1; idy++) {
                let html = `<img src="${this.closedIMG}"`
                    + `class="float-left mt-3">`
                $(`#${id} img:first`).before(html)
            }

        //  Activate nodes
            $(`#${id}`).click( () => {
                Dispatch({
                    action: 'DISPLAY_SELECTED_NODE_ITEMS',
                    message: id
                })
            })
        }
    },

    removeNode: function (nodeID) {
        $(`#${nodeID}`).remove()
    },

    toggleArrows: function (nodeID, state) {
        if (nodeID != this.rootID) {
            if (state == 'open') {
                $(`#${nodeID} img`).attr('src', this.expandIMG)
            }
            if (state == 'close') {
                $(`#${nodeID} img`).attr('src', this.closedIMG)
            }
        }
    }
}

let DataGrid = {

    initialize: function (init) {
        this.headID = init.headID
        this.bodyID = init.bodyID
        this.filterClearBtn = init.filterClearBtn

        $(this.filterClearBtn).click( () => {
            $('.filter').each( function () { $(this).val('') })
            Dispatch({
                action: 'CLEAR_FILTER',
                message: null
            })
        })
    },

    renderHead: function(view) {
        this.renderTitle(this.headID, view)
        let inputs = this.renderFilter(this.headID, view)
        Dispatch({
            action: 'STORE_FILTER_INPUTS',
            message: inputs
        })
    },

    renderBody: function (view, rows, filter, colors) {
        this.renderRows(this.bodyID, view, rows, filter, colors)
    },

    renderTitle: function (id, view) {
        let columns = view.columns

        $(id).empty()

    //  Create row
        let frag = document.createDocumentFragment()
        let row = document.createElement('div')
        row.className = 'row bg-grid-header pt-2'

    //  Create columns
        for (let idx = 0; idx < columns.length; idx++) {
            let colAttr = columns[idx]
            let col = document.createElement('div')
            col.className = `col-${colAttr.width}`
            let elm = document.createElement('h6')
            elm.textContent = colAttr.title
            col.appendChild(elm)
            row.appendChild(col)
        }
        frag.appendChild(row)
        $(id).append(frag)
    },

    renderFilter: function (id, view) {
        let columns = view.columns

    //  Create row
        let frag = document.createDocumentFragment()
        let row = document.createElement('div')
        row.className = 'row bg-grid-header'
        let inputs = {}

    //  Create columns
        for (let idx = 0; idx < columns.length; idx++) {
            let colAttr = columns[idx]
            var col = document.createElement('div')
            col.className = `col-${colAttr.width} pl-1 pr-1 pb-2`
            var elm = document.createElement('input')
            elm.id = colAttr.field
            elm.className = 'form-control form-control-sm filter'
            elm.type = 'text'
            col.appendChild(elm)
            row.appendChild(col)

            inputs[colAttr.field] = ''
        }
        frag.appendChild(row)
        $(id).append(frag)

    //  Keyup event
        $('.filter').keyup( () => {
            let inputs = {}
            $('.filter').each( function () {
                let key = $(this).attr('id');
                let val = $(this).val();
                inputs[key] = val;
            })
            Dispatch({
                action: 'DISPLAY_FILTERED_ITEMS',
                message: inputs
            })
        })
        return inputs
    },

    renderRows: function (id, view, rows, filter, colors) {
        let rowAttr = view.attributes
        let columns = view.columns

        $(id).empty()

    //  Create fragment
        let frag = document.createDocumentFragment()
        for (let idx = 0; idx < rows.length; idx++) {

        //  Create row
            let row = document.createElement('div')
            row.id = rows[idx][rowAttr.id]
            row.className = 'row grid-row border border-top-0'

        //  Set Background Color
            if (colors.active) {
                if (colors.schema.hasOwnProperty(rows[idx][colors.key])) {
                    row.style.background = colors.schema[rows[idx][colors.key]]
                }
            }

        //  Create row columns
            let filterRowMatch = true  // Set filter row match condition
            for (let idy = 0; idy < columns.length; idy++) {
                let colAttr = columns[idy]
                let col = document.createElement('div')
                col.className = `col-${colAttr.width} data`
                col.setAttribute('data-field', colAttr.field)
                col.setAttribute('data-type', colAttr.dtype)
                col.contentEditable = colAttr.edit
                let datum = rows[idx][colAttr.field]
                let text = this.formatData(datum, colAttr.dtype)
                col.textContent = text
                row.appendChild(col)

            //  Filter Row
                let key = colAttr.field
                let val = text
                if (filter[key] != '') {
                    var filterExp = new RegExp(filter[key], 'gi');
                    if (!filterExp.test(val)) { filterRowMatch = false }
                }
            }
            if (filterRowMatch) { frag.appendChild(row) }
        }
        $(id).append(frag)
    },

    highlightNode: function (nodeID, state) {
        if (state == 'on') {
            $(`#${nodeID}`).addClass('list-group-item-success')
        }
        if (state == 'off') {
            $(`#${nodeID}`).removeClass('list-group-item-success')
        }
    },

    formatData: function (data, type) {
        if (data != undefined) {
            switch (type) {
            case 'string':
                return data.trim()
            case 'number':
                return data.toLocaleString('en-US')
            case 'currency':
                return data.toLocaleString('en-US')
            case 'date':
                let ts = new Date(data)
                let month = (ts.getMonth( ) + 1).toString( )
                let date = (ts.getDate( )).toString( )
                let year = (ts.getFullYear( )).toString( )
                return dateSTR = month + '-' + date + '-' + year
            }
        } else { return '' }
    }
}

let SignInForm = {

    initialize: function (props) {
        this.usernameInput = props.usernameInput
        this.passwordInput = props.passwordInput
        this.signinButton = props.signinButton

        $(this.usernameInput).focus()
        $(this.signinButton).click( () => { this.query() })
        $(this.passwordInput).keypress( (e) => {
            if (e.which == 13) { this.query() }
        })
    },

    query: function () {
        let credentials = {}
        credentials.username = $(this.usernameInput).val()
        credentials.password = $(this.passwordInput).val()
        Dispatch({
            action: 'AUTHENTICATE_USER',
            message: credentials
        })
    }
}

let ModalMessage = {

    initialize: function (init) {
        this.modal = init.modal
        this.text = init.text
    },

    display: function (message) {
        $(this.text).html(message)
        $(this.modal).modal()
    }
}

let NavigationBar = {

    initialize: function (init) {
        this.navLinks = init.navLinks

        $(this.navLinks).click( (event) => {
            event.preventDefault();
            let href = $(event.target).attr('href');
            if (href.indexOf('#') == 0) {
                $(href).modal();
            }
        })
    }
}

let ModalIcon = {

    initialize: function (init) {
        this.checkBox = init.checkBox
        this.select = init.select
    },

    initCheckbox: function (key, checked) {
        let id = this.checkBox[key]
        $(id).prop('checked', checked)
        $(id).change( function () {
            Dispatch({
                action: 'CHANGE_SETTING',
                message: { key: key, value: this.checked }
            })
        })
    },

    initSelect: function (key, items) {
        let id = this.select[key]
        for (let idx = 0; idx < items.length; idx++) {
            let name = items[idx]
            let option = `<option value="${idx}">${name}</option>`
            $(id).append(option)
        }
    }
}
