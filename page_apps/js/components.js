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

    initialize: function (propsOBJ) {
        this.listID = propsOBJ.listID
        this.circleIcon = propsOBJ.circleIcon
        this.closedIcon = propsOBJ.closedIcon
        this.expandIcon = propsOBJ.expandIcon
    },

    render: function (request) {
        switch (request.action) {
        
        case 'RENDER_ROOT':
            this.renderRoot(request.data)
            break

        case 'RENDER_NODES':
            this.renderNodes(request.data)
            break

        case 'HIGHLIGHT_NODE':
            this.highlightNode(request.data)
        }
    },

    renderRoot: function (nodeOBJ) {
        let html = `<button id="${nodeOBJ.id}" type="button"`
            + `class="node list-group-item list-group-item-action list-group-item-secondary">`
            + `<img src="${this.circleIcon}" class="float-left mt-3 mr-2">`
            + `<div class="text-truncate">${nodeOBJ.name}`
            + `<br>${nodeOBJ.desc}</div></button>`
        $(this.listID).append(html)
        $(`#${nodeOBJ.id}`).click( () => {
            Dispatch({
                action: 'DISPLAY_SELECTED_NODE_ITEMS',
                message: nodeOBJ.id
            })
        })
    },

    renderNodes: function (nodeID, nodes, level) {
        for (let idx = nodes.length - 1; idx > -1; idx--) {

        //  Insert node
            let html = `<button id="${nodes[idx]._id}" type="button"`
                + `class="node list-group-item list-group-item-action list-group-item-secondary">`
                + `<img src="${this.closedIcon}" class="float-left mt-3 mr-2">`
                + `<div class="text-truncate">${nodes[idx].part_TAG}`
                + `<br>${nodes[idx].dscr_STR}</div></button>`
            $(html).insertAfter(`#${nodeID}`)

        //  Insert level icons
            for (let idy = 0; idy < level - 1; idy++) {
                let html = `<img src="${this.closedIcon}"`
                    + `class="float-left mt-3">`
                $(`#${nodes[idx]._id} img:first`).before(html)
            }

        //  Activate nodes
            $(`#${nodes[idx]._id}`).click( () => {
                Dispatch({
                    action: 'DISPLAY_SELECTED_NODE_ITEMS',
                    message: nodes[idx]._id
                })
            })
        }
    },

    removeNode: function (nodeID) {
        $(`#${nodeID}`).remove()
    },

    toggleArrows: function (node, state) {
        if (state == 'open') {
            $(`#${node} img`).attr('src', this.expandIcon)
        }
        if (state == 'close') {
            $(`#${node} img`).attr('src', this.closedIcon)
        }
    },

    highlightNode: function (id, state) {
        if (state == 'on') {
            $(`#${id}`).addClass('list-group-item-success')
        }
        if (state == 'off') {
            $(`#${id}`).removeClass('list-group-item-success')
        }
    }
}

let DataGrid = {

    initialize: function (propsOBJ) {
        this.headID = propsOBJ.headID
        this.bodyID = propsOBJ.bodyID
    },

    render: function(dataOBJ) {
        this.renderHead(this.headID, dataOBJ.format)
        this.renderBody(this.bodyID, dataOBJ.format, dataOBJ.rows)
    },

    renderHead: function (id, formatARY) {
        $(id).empty()

    //  Create row
        let frag = document.createDocumentFragment()
        let row = document.createElement('div')
        row.className = 'row grid-header-bg pt-2'

    //  Create columns
        for (let idx = 0; idx < formatARY.length; idx++) {
            let col = document.createElement('div')
            col.className = `col-${formatARY[idx].width}`
            let elm = document.createElement('h6')
            elm.textContent = formatARY[idx].title
            col.appendChild(elm)
            row.appendChild(col)
        }
        frag.appendChild(row)
        $(id).append(frag)
    },

    renderBody: function (id, formatARY, rowsARY) {
        $(id).empty()

    //  Create fragment
        let frag = document.createDocumentFragment()
        for (let idx = 0; idx < rowsARY.length; idx++) {
        
        //  Create row
            let row = document.createElement('div')
            row.id = rowsARY[idx]['_id']
            row.className = 'row grid-row border border-top-0'
    
        //  Create row columns
            for (let idy = 0; idy < formatARY.length; idy++) {
                let col = document.createElement('div')
                let colAttr = formatARY[idy]
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
