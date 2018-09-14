/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

/** Menu **/
let MenuCP = Object.create(NavigationBar)

    MenuCP.initialize({
        navLinks: '.navbar-brand, .nav-link'
    })

/** Message **/
let NotificationCP = Object.create(ModalMessage)

    NotificationCP.initialize({
        modal: '#modal-message',
        text: '#modal-message-text'
    })

/** Application Initialization **/
let PageCP = Object.create(Page)

    Application.initialize({
        page: PageCP,
        menu: MenuCP,
        note: NotificationCP
    })

    Application.start( function () {

        Dispatch({
            action: 'QUERY_PROJECTS_LIST',
            message: null
        })
    
        Dispatch({
            action: 'QUERY_VIEWS_LIST',
            message: null
        })
    })

/** Projects List **/
let ProjectSelectorCP = Object.create(ProjectSelector)

    ProjectSelectorCP.initialize({
        selectID: '#select-project'
    })

    ProjectsList.initialize({
        component: ProjectSelectorCP,
        queryPATH: '/navigator/projects',
        note: Application.note
    })

/** Views List **/
let ViewSelectorCP = Object.create(ViewSelector)

    ViewSelectorCP.initialize({
        selectID: '#select-view'
    })

    ViewsList.initialize({
        component: ViewSelectorCP,
        viewIDX: 0,
        queryPATH: '/navigator/views',
        note: Application.note
    })

/** Project Items **/
    ProjectItems.initialize({
        queryPATH: '/navigator/parts',
        note: Application.note,
        idKEY: '_id',
        parentKEY: 'parent_ID'
    })

/** Project Assemblies in Side Bar **/
let SideBarCP = Object.create(SideBarGroup)
    SideBarCP.initialize({
        listID: '#sidebar',
        circleIcon: 'img/circle.png',
        closedIcon: 'img/closed.png',
        expandIcon: 'img/expand.png'
    })

    Assemblies.initialize({
        component: SideBarCP,
        view: { id: '_id', name: 'part_TAG', desc: 'dscr_STR' }
    })

/** Project Parts in Grid Model **/
let PartsGridCP = Object.create(DataGrid)
    PartsGridCP.initialize({
        headID: '#grid-header',
        bodyID: '#grid-body',
        filterClearBtn: '#btn-filter-clear'
    })

    Parts.initialize({
        component: PartsGridCP
    })
