define(['altair/facades/declare',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin'
], function (declare,
             _IsCommanderMixin) {

    return declare([_IsCommanderMixin], {


        /**
         * Refresh server strategies so we have options for our schema
         *
         * @returns {altair.Deferred}
         */
        startup: function () {
            var _args = arguments;
            return this.parent.refreshStrategies().then(this.hitch(function () { return this.inherited(_args); }));
        },

        /**
         * Startup a web server
         */
        start: function (options) {

            var named = options.strategy || this.parent.get('defaultStrategy');

            //refresh strategies
            return this.parent.refreshStrategies().then(this.hitch(function (strategies) {

               return this.forge(strategies[named], null, { startup: false });

            })).then(this.hitch(function (server) {

                //prompt user for schema
                return this.form(server.schema());

            })).then(this.hitch(function (values) {

                //start the new server
                return this.parent.startupServer(named, values).otherwise(this.hitch('log'));

            }));



        },

        startRecycle: function (options) {

            var recycle = this.hitch(function () {

                this.start(options).then(this.hitch(function (server) {

                    setTimeout(this.hitch(function () {

                        if(server) {
                            server.teardown().then(recycle).otherwise(this.hitch('log'));
                        } else {
                            recycle();
                        }

                    }), 5000);

                }));

            });

            recycle();

        },

        /**
         * Update schema at runtime
         *
         * @param named
         */
        schemaForCommand: function (named) {

            var schema = this.inherited(arguments),
                strategies;

            //the newModule command has some choices that need updating (destination dir)
            if(named === 'start' || named === 'startRecycle') {

                strategies = this.parent.strategies();
                schema.setOptionFor('strategy', 'choices', strategies);

            }


            return schema;
        }

    });
});