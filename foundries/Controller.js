define(['altair/facades/declare',
        'altair/plugins/node!path',
        'altair/mixins/_DeferredMixin',
        'lodash'
], function (declare,
             pathUtil,
             _DeferredMixin,
             _) {

    "use strict";

    return declare([_DeferredMixin], {

        _controllers: null, //cache of controllers to keep from double generating
        _namespaces:  null, //all the namespaces we have forged

        constructor: function () {
            this._controllers = {};
            this._namespaces  = {};
        },

        nameForRoute: function (vendor, route) {

            var callbackParts   = route.action.split('::'),
                controllerName  = callbackParts[0].indexOf(':') == -1 ? vendor + ':*/' + callbackParts[0] : callbackParts[0];

            return controllerName;
        },

        hasController: function (named) {
            return _.has(this._controllers, named);
        },

        controller: function (named) {
            return this._controllers[named];
        },

        hasNamespace: function (named) {
            return _.has(this._namespaces, named);
        },

        controllersInNamespace: function (named) {
            return this._namespaces[named];
        },

        forgeForRoute: function (path, vendor, route, options, config) {

            var callbackParts   = route.action.split('::'),
                controllerName  = this.nameForRoute(vendor, route),
                controller      = controllerName == callbackParts[0] ? null : pathUtil.join(path, callbackParts[0]),
                _config         = config || {};

            _config.path = controller;
            _config.startup = false;


            return this.forgeController(controllerName, options, _config)

        },

        forgeController: function (named, options, config) {

            var dfd,
                sitePath,
                _config         = config || {},
                path            = _config.path,
                startup         = _.has(_config, 'startup') ? _config.startup : true,
                parent          = _config.parent,
                namespace       = named.split('/').shift();

            path = path || this.parent.resolvePath(named);

            //are we starting up the controller?
            if (_.isUndefined(startup)) {
                startup = true;
            }

            //build sitePath
            sitePath = pathUtil.resolve(pathUtil.join(path, '..', '..'));

            //track all the namespaces (1 per site)
            if (!this._namespaces[namespace]) {
                this._namespaces[namespace] = [];
            }

            //controller already ready
            if (_.has(this._controllers, named)) {

                dfd = this.when(this._controllers[named]);

            } else {

                dfd =  this.forge(path || named, options, { type: 'controller', startup: startup, parent: parent, name: named, foundry: this.hitch(function (Class, options, config) {

                    //override paths for things to be off the sitePath (vs relative to the controller)
                    Class.extendOnce({
                        sitePath:       sitePath,
                        dir:            sitePath
                    });

                    var controller = config.defaultFoundry(Class, options, config);

                    this._controllers[named] = controller;
                    this._namespaces[namespace].push(controller);

                    return controller;


                })});

                this._controllers[named] = dfd;

            }

            return dfd;

        }



    });

});
