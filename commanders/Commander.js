define(['altair/facades/declare',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin',
        'altair/plugins/node!fs',
        'lodash'
],
    function (declare, _IsCommanderMixin, fs, _) {

        return declare([_IsCommanderMixin], {


            /**
             * Refresh server strategies so we have options for our schema
             *
             * @returns {altair.Deferred}
             */
            startup: function () {
                var _args = arguments;
                return this.parent.refreshStrategies().then(this.hitch(function () {
                    return this.inherited(_args);
                }));
            },

            /**
             * Startup a web server
             */
            start: function (options) {

                var named = options.strategy || this.parent.get('defaultStrategy');

                //refresh strategies
                return this.parent.refreshStrategies().then(this.hitch(function (strategies) {

                    //forge one, but do not start it up
                    return this.forge(strategies[named], null, { startup: false });

                })).then(this.hitch(function (server) {

                    //prompt user for schema
                    return this.form(server.schema());

                })).then(this.hitch(function (values) {

                    //start the new server and user the router that parses packages
                    values.router = 'routers/Package';
                    return this.parent.startupServer(named, values).otherwise(this.hitch('log'));

                }));


            },


            /**
             * Start a webserver that reboots every 5 seconds (I think there is an issue with express that breaks this ability)
             *
             * @param options
             */
            startRecycle: function (options) {

                var recycle = this.hitch(function () {

                    this.start(options).then(this.hitch(function (server) {

                        setTimeout(this.hitch(function () {

                            if (server) {
                                server.teardown().then(recycle).otherwise(this.hitch('err'));
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
            schemaForCommand: function (command) {

                var schema = this.inherited(arguments),
                    strategies;

                //the newModule command has some choices that need updating (destination dir)
                if (command.callback === 'start' || command.callback === 'startRecycle') {

                    strategies = this.parent.strategies();
                    schema.setOptionFor('strategy', 'choices', strategies);

                }


                return schema;
            },

            /**
             * Forge a new website
             *
             * @param values
             * @returns {Deferred}
             */
            site: function (values) {


                return this.parent.forge('foundries/App').then(function (app) {

                    return app.forge(values);

                }).step(function (msg) {

                    this.writeLine(msg);

                }.bind(this)).then(function () {

                    this.writeLine('site created at: ' + values.destination);
                    this.writeLine('run the following commands:', 'h1');
                    this.writeLine('-----------------------');
                    this.writeLine('| $cd ' + values.destination);
                    this.writeLine('| $altair');
                    this.writeLine('-----------------------');


                }.bind(this));


            }

        });
    });