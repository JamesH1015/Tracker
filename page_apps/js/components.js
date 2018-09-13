/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

let Page = {

    ready: function (func) {
        $(document).ready(func)
    }
}

let ProjectSelector = {

    initialize: function (propsOBJ) {
        this.selectID = propsOBJ.selectID
    },

    render: function (dataARY) {
        this.append(this.selectID, dataARY)
        this.activate(this.selectID)
    },

    append: function (id, itemsARY) {
        for (let idx = 0; idx < itemsARY.length; idx++) {
            let itemOBJ = itemsARY[idx]
            let htmlSTR = `<option value="${itemOBJ._id}">`
                + `${itemOBJ.proj_TAG} ${itemOBJ.cust_TAG}</option>`
            $(id).append(htmlSTR)
        }
    },

    activate: function (id) {
        $(id).change( () => {
            let projID = $(`${id} option:selected`).attr('value')
            Dispatch({
                action: 'DISPLAY_SELECTED_PROJECT',
                message: projID
            })
        })
    }
}

let ViewSelector = {

    initialize: function (propsOBJ) {
        this.selectID = propsOBJ.selectID
    },

    render: function (dataARY) {
        this.append(this.selectID, dataARY)
        this.activate(this.selectID)
    },
    
    append: function (id, itemsARY) {
        for (let idx = 0; idx < itemsARY.length; idx++) {
            let itemOBJ = itemsARY[idx]
            let htmlSTR = `<option value="${idx}">${itemOBJ.name}</option>`
            $(id).append(htmlSTR)
        }
    },

    activate: function (id) {
        $(id).change( () => {
            let viewIDX = $(`${id} option:selected`).attr('value')
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

    initialize: function (propsOBJ) {
        this.headID = propsOBJ.headID
        this.bodyID = propsOBJ.bodyID
    },

    render: function(view, rows) {
        this.renderHead(this.headID, view.columns)
        this.renderBody(this.bodyID, view.attributes, view.columns, rows)
    },

    renderHead: function (id, columnsARY) {
        $(id).empty()

    //  Create row
        let frag = document.createDocumentFragment()
        let row = document.createElement('div')
        row.className = 'row grid-header-bg pt-2'

    //  Create columns
        for (let idx = 0; idx < columnsARY.length; idx++) {
            let col = document.createElement('div')
            col.className = `col-${columnsARY[idx].width}`
            let elm = document.createElement('h6')
            elm.textContent = columnsARY[idx].title
            col.appendChild(elm)
            row.appendChild(col)
        }
        frag.appendChild(row)
        $(id).append(frag)
    },

    renderBody: function (id, rowAttr, columnsARY, rowsARY) {
        $(id).empty()

    //  Create fragment
        let frag = document.createDocumentFragment()
        for (let idx = 0; idx < rowsARY.length; idx++) {
        
        //  Create row
            let row = document.createElement('div')
            row.id = rowsARY[idx][rowAttr.id]
            row.className = 'row grid-row border border-top-0'
    
        //  Create row columns
            for (let idy = 0; idy < columnsARY.length; idy++) {
                let col = document.createElement('div')
                let colAttr = columnsARY[idy]
                col.className = `col-${colAttr.width} data`
                col.setAttribute('data-field', colAttr.field)
                col.setAttribute('data-type', colAttr.dtype)
                col.contentEditable = colAttr.edit
                let datum = rowsARY[idx][colAttr.field]
                let text = this.formatData(datum, colAttr.dtype)
                col.textContent = text
                row.appendChild(col)
            }
            frag.appendChild(row)
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
