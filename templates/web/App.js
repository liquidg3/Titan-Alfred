define(['altair/facades/declare',
    'titan/modules/alfred/models/App'
], function (declare,
             App) {

    return declare([App], {


        /**
         * Called when the app is being started up.
         *
         * @param options
         * @returns {*}
         */
        startup: function (options) {
            return this.inherited(arguments);
        },

        /**
         * The server is about to be executed. This happens once right at startup.
         *
         * @param e {altair/events/Event}
         */
        onWillExecuteServer:    function (e) {
            this.inherited(arguments);
        },

        /**
         * The server has been executed and should be listening on some port
         *
         * @param e {altair/events/Event}
         */
        onDidExecuteServer:     function (e) {
            this.inherited(arguments);
        },


        /**
         * A request was received.
         *
         * @param e {altair/events/Event}
         */
        onDidReceiveRequest:    function (e) {
            this.inherited(arguments);
        },

        /**
         * I've done all my rendering (handled by the controller) and am about to respond to the client.
         *
         * @param e {altair/events/Event}
         */
        onWillSendResponse:     function (e) {
            this.inherited(arguments);
        },

        /**
         * I have sent the response.
         *
         * @param e {altair/events/Event}
         */
        onDidSendResponse:      function (e) {
            this.inherited(arguments);
        }



    });

});