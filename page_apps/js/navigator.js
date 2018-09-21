/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

/** Application Initialization **/
let Page = Object.create(HTMLDoc)

let Menu = Object.create(NavigationBar)

    Menu.initialize({
        navLinks: '.navbar-brand, .nav-link'
    })

let Message = Object.create(ModalMessage)

    Message.initialize({
        modal: '#modal-message',
        text: '#modal-message-text'
    })

    Application.initialize({
        win: { page: Page, menu: Menu, message: Message }
    })

    Application.start( function () {

        UserProfile.action({
            action: 'LOAD_PROFILE',
            message: null
        })

        ProjectsList.action({
            action: 'QUERY_PROJECTS_LIST',
            message: null
        })

        ViewsList.action({
            action: 'QUERY_VIEWS_LIST',
            message: null
        })

        Parts.action({
            action: 'QUERY_COLORS',
            message: null
        })
    })

/** UserProfile **/
let Icon = Object.create(ModalIcon)

    Icon.initialize({
        checkBox: {
            highlightRows: '#check-highlight-rows',
            showAll: '#check-show-all'
        },
        select: {
            selectColorScheme: '#select-highlight-schema'
        }
    })

    UserProfile.initialize({
        win: { icon: Icon },
        query: { path: '/navigator/users' },
        view: {
            colorsActive: { name: 'highlightRows', type: 'checkbox' },
            colorsSchema: { name: 'selectColorScheme', type: 'select' },
            itemsAll: { name: 'showAll', type: 'checkbox' }
        }
    })

/** Projects List **/
let ProjectSelector = Object.create(ProjectSelect)

    ProjectSelector.initialize({
        selectID: '#select-project'
    })

    ProjectsList.initialize({
        win: { select: ProjectSelector, message: Message },
        query: { path: '/navigator/projects' },
        view: { id: '_id', name: 'proj_TAG', desc: 'cust_TAG' }
    })

/** Views List **/
let ViewSelector = Object.create(ViewSelect)

    ViewSelect.initialize({
        selectID: '#select-view'
    })

    ViewsList.initialize({
        win: { select: ViewSelector, message: Message },
        query: { path: '/navigator/views' }
    })

/** Project Items **/
    ProjectItems.initialize({
        queryPATH: '/navigator/parts',
        note: Application.note,
        idKEY: '_id',
        parentKEY: 'parent_ID'
    })

/** Project Assemblies in Side Bar **/
let SideBar = Object.create(SideBarGroup)
    SideBar.initialize({
        listID: '#sidebar',
        circleIcon: 'img/circle.png',
        closedIcon: 'img/closed.png',
        expandIcon: 'img/expand.png'
    })

    Assemblies.initialize({
        component: SideBar,
        view: { id: '_id', name: 'part_TAG', desc: 'dscr_STR' }
    })

/** Project Parts in Grid Model **/
let PartsGrid = Object.create(DataGrid)
    PartsGrid.initialize({
        headID: '#grid-header',
        bodyID: '#grid-body',
        filterClearBtn: '#btn-filter-clear'
    })

    Parts.initialize({
        win: { grid: PartsGrid, message: Message },
        query: { path: '/navigator/colors' }
    })

let PartsEdit = Object.create(GridEdit)
    PartsEdit.initialize({
        bodyID: '#grid-body',
        insertBtn: '#btn-insert',
        saveBtn: '#btn-save'
    })

    PartsEditor.initialize({
        win: { edit: PartsEdit, message: Message },
        query: { path: '/navigator/parts' }
    })

/** Dispatch **/
let Dispatch = function (request) {
    UserProfile.action(request)
    ProjectsList.action(request)
    ViewsList.action(request)
    ProjectItems.action(request)
    Assemblies.action(request)
    Parts.action(request)
    PartsEditor.action(request)
}
