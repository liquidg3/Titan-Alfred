define(['altair/facades/declare',
    'altair/modules/commandcentral/mixins/_IsCommanderMixin',
    'altair/facades/hitch'
], function (declare,
             _IsCommanderMixin,
             hitch) {

    return declare([_IsCommanderMixin], {


        /**
         * Startup the web server
         */
        start: function () {

            this.module.startupServer();

        }

    });
});