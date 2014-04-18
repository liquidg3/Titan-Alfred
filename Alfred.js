/**
 * Bringing a simple MVC environment for building web apps to Altair
 *
 * @author:     Jon Hemstreet, Taylor Romero
 * @license:    MIT
 * @vendor:     titan
 * @module:     Alfred
 * @nexus:      this.nexus("titan:Alfred")
 *
 */
define(['altair/facades/declare',
        'altair/facades/hitch',
        'lodash',
        'altair/modules/adapters/mixins/_HasAdaptersMixin',
        'altair/modules/commandcentral/mixins/_HasCommandersMixin'
], function (declare,
             hitch,
             _,
             _HasAdaptersMixin,
             _HasCommandersMixin) {

    return declare([_HasAdaptersMixin, _HasCommandersMixin], {

        startup: function (options) {

            var _options = options || this.options;

            //of no adapter was passed to startup, lets set one now. if one was passed, it's already set for us
            //(meaning we don't need to have an 'else,' nor do we mutate options)
            if(!_options || !_options.selectedAdapter) {
                this.set('selectedAdapter', 'adapters/Express3');
            }

            return this.inherited(arguments);

        },

        execute: function () {

            if(this.get('autostart')) {
                this.log('autostarting server');
                this.startupServer();
            }

            return this.inherited(arguments);
        },

        startupServer: function (options) {

            var a = this.adapter();
            this.log('starting server using ' + a.name);
            return a.execute();

        },

        teardownServer: function () {
        },

        refreshRegisteredRoutes: function () {

            return this.emit('register-routes').then(function (routes) {
                return _.flatten(routes);
            });
        }

    });
});