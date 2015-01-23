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
        './extensions/Model',
        './extensions/HttpResponseValues',
        './extensions/Noop',
        'altair/mixins/_AssertMixin',
        'altair/plugins/node!path',
        'altair/plugins/node!fs'
], function (declare,
             _,
             _HasSchemaMixin,
             _HasCommandersMixin,
             _HasServerStrategiesMixin,
             require,
             ModelExtension,
             HttpResponseValuesExtension,
             NoopExtension,
             _AssertMixin,
             pathUtil,
             fs) {

    return declare([_HasSchemaMixin, _HasCommandersMixin, _HasServerStrategiesMixin, _AssertMixin], {

        //all the strategies we have registered, key is name, value is nexus id
        _strategies:    null,
        _activeServers: null,
        _controllerFoundry: null,

        //during startup, lets add some extensions to make all the MVC functionality work beautifully
        startup: function (options) {

            var _options            = options || this.options || {},
                cartridge           = _options.extensionCartridge || this.nexus('cartridges/Extension'),
                httpResponse        = _options.httpResponseExtension || new HttpResponseValuesExtension(cartridge),
                model               = _options.modelExtension || new ModelExtension(cartridge),
                noop                = _options.noopExtension || new NoopExtension(cartridge);

            this._activeServers = [];

            //drop in new extensions
            this.deferred = cartridge.addExtensions([model, httpResponse, noop]).then(this.hitch(function () {

                return this;

            })).then(this.hitch(function () {

                //create our controller foundry
                return this.forge('./foundries/Controller');

            })).then(this.hitch(function (foundry) {

                this._controllerFoundry = foundry;

                return this;

            }));

            return this.inherited(arguments);

        },

        execute: function (options) {

            var _options = options || this.options || {};

            if (_options.site) {

                this.assert(!!_options.site.options, 'You must pass your site options. See README.md for more details.');

                if (!_options.site.options.dir) {
                    _options.site.options.dir = '.';
                }

                _options.site.options.dir = this.nexus('Altair').resolvePath(_options.site.options.dir);

                this.deferred = this.refreshStrategies().then(function () {
                    return this.startupServer(_options.site.strategy, _options.site.options);
                }.bind(this));

            }

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

            var _options = options || {},
                app,
                appPath,
                name,
                server;

            this.assert(!!this._strategies, 'You must call refreshStrategies before starting up a titan:Alfred web server.');
            this.assert(!!this._strategies[strategy], 'You must pass a valid web server strategy to titan:Alfred');

            //pass controller foundry to the router
            _options.controllerFoundry = this._controllerFoundry;
            _options.strategy = strategy;

            appPath = pathUtil.join(_options.dir, 'App');

            //create a app
            appPath = fs.existsSync(appPath + '.js') ? appPath : 'models/App';
            name    = _options.vendor + ':*';

            return this.forge(appPath, _options, { type: 'app', name: name, parent: null }).then(function (app) {

                this._nexus.set(app.name, app);
                return app.execute();

            }.bind(this));


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

        },

        /**
         * All the servers we have running.
         *
         * @returns {[]}
         */
        activeServers: function () {
            return this._activeServers || [];
        },

        /**
         * Tears down all active servers;
         *
         * @returns {*}
         */
        teardown: function () {

            return this.all(_.map(this._activeServers, function (server) {

                return server.teardown();

            }, this)).then(function () {

                return this;

            }.bind(this));

        }

    });
});