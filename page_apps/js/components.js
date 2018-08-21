/**
 *  Tracker
 *  Copyright 2018 James Houck, REI Automation, Inc. All rights reserved.
 */

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
