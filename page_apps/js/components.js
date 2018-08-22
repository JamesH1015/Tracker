/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let ProjectSelector = {

    initialize: function (props) {
        this.selector = props.selector

        Dispatch({
            action: 'RETRIEVE_PROJECTS_LIST',
            message: null
        })
    },

    render: function (list) {
        for (let idx = 0; idx < list.length; idx++) {
            let item = list[idx]
            let html = `<option value="${item['_id']}">`
                + `${item['proj_TAG']} ${item['cust_TAG']}</option>`
            $(this.selector).append(html)
        }
        this.activate()
    },

    activate: function () {
        $(this.selector).change( () => {
            let projID = $(`${this.selector} option:selected`).attr('value')
            Dispatch({
                action: 'RETRIEVE_PROJECT_ITEMS',
                message: projID
            })
        })
    }
}

let SideBarGroup = {

    initialize: function (props) {
        this.listId = props.listId
        this.circleIcon = props.circleIcon
        this.closedIcon = props.closedIcon
        this.expandIcon = props.expandIcon
    },

    renderRoot: function (id, name, desc) {
        let html = `<button id="${id}" type="button"`
            + `class="node list-group-item list-group-item-action list-group-item-secondary" data-level="0">`
            + `<img src="${this.circleIcon}" class="float-left mt-3 mr-2">`
            + `<div class="text-truncate">${name}`
            + `<br>${desc}</div></button>`
        $(this.listId).append(html)
        $('#'+ id).click( () => {
            Dispatch({
                action: 'LOAD_NODE_DATA',
                message: { id: id }
            })
        })
    },

    renderNodes: function (ancestor, nodes) {
        for (let idx = nodes.length - 1; idx > -1; idx--) {
            let html = `<button id="${nodes[idx]._id}" type="button"`
                + `class="node list-group-item list-group-item-action list-group-item-secondary" data-level="0">`
                + `<img src="${this.closedIcon}" class="float-left mt-3 mr-2">`
                + `<div class="text-truncate">${nodes[idx].part_TAG}`
                + `<br>${nodes[idx].dscr_STR}</div></button>`
            $(html).insertAfter(`#${ancestor}`)
            $(`#${nodes[idx]._id}`).click( () => {
                Dispatch({
                    action: 'LOAD_NODE_DATA',
                    message: { id: nodes[idx]._id }
                })
            })
        }
    }
}

let DataGrid = {

    initialize: function (props) {
        this.headId = props.headId
        this.bodyId = props.bodyId
    },

    renderHead: function (view) {
        $(this.headId).empty()

    //  Create row
        let frag = document.createDocumentFragment()
        let row = document.createElement('div')
        row.className = 'row grid-header-bg pt-2'

    //  Create columns
        for (let idx = 0; idx < view.length; idx++) {
            let col = document.createElement('div')
            col.className = `col-${view[idx].width}`
            let elm = document.createElement('h6')
            elm.textContent = view[idx].title
            col.appendChild(elm)
            row.appendChild(col)
        }
        frag.appendChild(row)
        $(this.headId).append(frag)
    },

    renderBody: function (view, data) {
        $(this.bodyId).empty()

    //  Create fragment
        let frag = document.createDocumentFragment()
        for (let idx = 0; idx < data.length; idx++) {
        
        //  Create row
            let row = document.createElement('div')
            row.id = data[idx]['_id']
            row.className = 'row grid-row border border-top-0'
    
        //  Create row columns
            for (let idy = 0; idy < view.length; idy++) {
                let col = document.createElement('div')
                let colAttr = view[idy]
                col.className = `col-${colAttr.width} data`
                col.setAttribute('data-field', colAttr.field)
                col.setAttribute('data-type', colAttr.dtype)
                col.contentEditable = colAttr.edit
                let datum = data[idx][colAttr.field]
                let text = this.formatData(datum, colAttr.dtype)
                col.textContent = text
                row.appendChild(col)
            }
            frag.appendChild(row)
        }
        $(this.bodyId).append(frag)
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

    initialize: function (props) {
        this.modal = props.modal
        this.text = props.text
    },

    display: function (message) {
        $(this.text).html(message)
        $(this.modal).modal()
    }
}

let NavigationBar = {

    initialize: function (props) {
        this.navLinks = props.navLinks

        $(this.navLinks).click( (event) => {
            event.preventDefault();
            let href = $(event.target).attr('href');
            if (href.indexOf('#') == 0) {
                $(href).modal();
            }
        })
    }
}
