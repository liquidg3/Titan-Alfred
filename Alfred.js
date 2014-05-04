/**
 * Bringing a simple MVC environment for building web apps in Altair
 *
 * @author:     Jon Hemstreet, Taylor Romero
 * @license:    MIT
 * @copyright:  Taylor Romero, Inc 2014
 * @vendor:     titan
 * @module:     Alfred
 * @nexus:      this.nexus("titan:Alfred")
 *
 */
define(['altair/facades/declare',
        'lodash',
        'apollo/_HasSchemaMixin',
        'altair/modules/commandcentral/mixins/_HasCommandersMixin',
        './mixins/_HasServerStrategiesMixin',
        'require',
        './extensions/Model'
], function (declare,
             _,
             _HasSchemaMixin,
             _HasCommandersMixin,
             _HasServerStrategiesMixin,
             require,
             ModelExtension) {

    return declare([_HasSchemaMixin, _HasCommandersMixin, _HasServerStrategiesMixin], {

        //all the strategies we have registered, key is name, value is nexus id
        _strategies:    null,
        _activeServers: null,

        //during startup, lets add some extensions to make all the MVC functionality work beautifully
        startup: function (options) {

            var _options        = options || this.options || {},
                cartridge       = _options.extensionCartridge || this.nexus('cartridges/Extension'),
                model           = _options.modelExtension || new ModelExtension(cartridge);

            this._activeServers = [];

            //drop in new extensions
            this.deferred = cartridge.addExtension(model).then(this.hitch(function () {
                return this;
            }));

            return this.inherited(arguments);

        },

        execute: function () {
//
//            if(this.get('autostart')) {
//                this.log('autostarting server');
//                this.startupServer();
//            }

            return this.inherited(arguments);
        },

        /**
         * Startup a server by name
         *
         * @param strategy the name of the server strategy to use
         * @param _options options passed to the strategy.
         * @returns {altair.Deferred}
         */
        startupServer: function (strategy, options) {

            var _options = options || {};

            //create a router
            return this.forge(_options.router || 'routers/Path').then(function (router) {

                //generate populated routes (see strategies/README.md)
                return router.generateAppConfig(_options);

            }).then(this.hitch(function (app) {

                //pass the newly generated routes our server strategy
                _options = app;

                var _paths = {};

                //map the vendor
                if(!_options.vendor) {
                    throw new Error('You must set a vendor in your app config.');
                }

                //include paths
                _paths[_options.vendor] = _options.path;

                require({
                    paths: _paths
                });

                //if they passed a string, assume a foundry compatible class name
                if(_.isString(strategy)) {

                    //pass to the foundry for startup
                    return this.forge(this._strategies[strategy], _options);

                }
                //if a strategy was passed
                else {

                    //just start it up
                    return strategy.startup(_options);

                }

            })).then(this.hitch(function (server) {

                //execute the server
                server.execute();

                //add it to list of active servers
                this._activeServers.push(server);

                //we don't wait for the server to finish execution since it could be a long time
                return server;

            }));



        },

        /**
         * Currently available strategies, key is name, value is nexus id.
         *
         * @returns {*}
         */
        strategies: function () {
            return this._strategies;
        },

        /**
         * All the web server strategies we have available
         *
         * @returns {altair.Deferred}
         */
        refreshStrategies: function () {

            return this.emit('register-server-strategies').then(this.hitch(function (e) {

                var _strategies = {};

                _.each(e.results(), function (obj) {
                    _.merge(_strategies, obj);
                });

                this._strategies = _strategies;

                return _strategies;

            }));

        }

    });
});