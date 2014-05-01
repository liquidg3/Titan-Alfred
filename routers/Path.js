define(['altair/facades/declare',
        'altair/plugins/node!path',
        'lodash',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'altair/facades/all',
        'altair/facades/glob'
], function (declare,
             pathUtil,
             _,
             Lifecycle,
             hitch,
             all,
             glob) {

    return declare([Lifecycle], {

        //cache controllers by name
        _controllersByName: null,
        _validExtensions:   ['less', 'js', 'css'],
        _controllerFoundry: null,

        startup: function (options) {

            var _options = options || this.options || {};

            //if there is no controller foundry, lets create one
            if(!_options.controllerFoundry) {

                this.deferred = this.forge('../foundries/Controller').then(this.hitch(function (foundry) {
                    this._controllerFoundry = foundry;
                    return this;
                }));

            } else {
                this._controllerFoundry = _options.controllerFoundry;
            }

            this._controllersByName = _options.controllersByName || {};

            return this.inherited(arguments);

        },

        /**
         * Looks in the path for an app.json, then loads the files and sets up callbacks for the routes
         *
         * @param options override any local prop
         * @param controllerOptions any options you want passed to your controller for startup
         * @returns {altair.Deferred} will resolve with the populated and configured routes
         */
        generateAppConfig: function (options, controllerOptions) {

            var path = options.dir,
                json = pathUtil.join(path, 'app'),
                d    = new this.Deferred();

            //make sure path ends with a /
            if(path.slice(-1) !== '/') {
                path = path + '/';
            }

            //dependency injection
            if(options) {
                _.each(options, function (value, key) {
                    this['_' + key] = value;
                }, this);
            }

            //parse routes.json
            require(['altair/plugins/config!' + json], this.hitch(function (config) {

                if(!config) {
                    d.reject(new Error('Could not find ' + json));
                    return;
                }

                //clone the config so we never mutate it
                var _config = _.clone(config, true);

                _config.path = path;

                this.log('loading', config.name);

                _.each(_config.routes, function (route, url) {
                    route.url = url;
                });

                this.attachControllers(path, _config.vendor, _config.routes, controllerOptions)
                    .then(this.hitch('attachLayout', path, _config.routes))
                    .then(this.hitch('attachViews', path, _config.routes))
                    .then(this.hitch('attachMedia', path, _config.routes))
                    .then(hitch(d, 'resolve', _config))
                             .otherwise(hitch(d, 'reject'));


            }));


            return d;

        },

        /**
         * Attaches controllers to the routes
         *
         * @param path
         * @param routes
         * @param options
         * @returns {*|Promise}
         */
        attachControllers: function (path, vendor, routes, options) {

            var list = [];

            //setup routes with real callbacks
            _.each(routes, function (route, key) {

                //attach the controller to the route.. if an error occurs, log it and delete the route
                var d = new this.Deferred();
                list.push(d);

                //attach the controler
                this.attachControllerToRoute(path, vendor, route, options).then(function (route) {

                    d.resolve(routes);

                }).otherwise(this.hitch(function (err) {

                    //if it fails, log it, but keep going
                    this.log(err);
                    d.reject(routes);

                }));

            }, this);

            return all(list).then(function () {
                return routes;
            });

        },

        attachControllerToRoute: function (path, vendor, route, options) {

            var foundry         = this._controllerFoundry,
                deferred        = new this.Deferred(),
                action          = route.action.split('::').pop(),//action comes in form controlle/Name::action
                name            = foundry.nameForRoute(vendor, route),
                attach          = this.hitch(function (controller) {

                    if(!controller[action]) {
                        deferred.reject( new Error(controller + ' is missing action ' + action + '(e) for route "' + route.url + '"'));
                    } else {
                        this.log('attaching route ' + route.url + ' to callback ' + route.action );
                        route.callback    = hitch(controller, action);
                        route.controller  = controller;
                        route.action      = action;
                        deferred.resolve(route);
                    }

                });


            //de we have a version of this already?
            if(this._controllersByName[name]) {

                attach(this._controllersByName[name]);

            }
            //build new controller
            else {

                this._controllerFoundry.buildForRoute(path, vendor, route, options).then(function (controller) {
                    attach(controller);
                });

            }

            return deferred;


        },

        /**
         * Looks in a path and attaches the js/css to each route
         *
         * @param path
         * @param routes the routes pulled from app.json
         * @returns {altair.Deferred}
         */
        attachMedia: function (path, routes) {

            var list = [];

            _.each(routes, function (route) {

                var name        = route.layout || 'front',
                    predicate   = '{' + this._validExtensions.join(',') + '}',
                    d           = new this.Deferred(),
                    candidates  = [
                    path + 'public/' + predicate + '/*.' + predicate,
                    path + 'public/' + predicate + '/' + name + '/*.' + predicate
                ];

                list.push(d);
                route.media = {};

                glob(candidates).then(this.hitch(function (matches) {

                    //group all matches by file extension
                    _.each(matches, function (url) {

                        var ext = url.split('.').pop();

                        if(!route.media[ext]) {
                            route.media[ext] = [];
                        }

                        route.media[ext].push(url.replace(path, ''));

                    });

                    d.resolve();

                }));

            }, this);

            return all(list).then(function () {
                return routes;
            });

        },

        /**
         * Attach layouts to the routes
         *
         * @param path the folder we are using as the site root
         * @param routes the routes from app.json
         * @returns {*}
         */
        attachLayout: function (path, routes) {

            //loop through each rout and glob for candidates
            var list = [];

            _.each(routes, function (route) {

                var name        = route.controller.name.split('/').pop().toLowerCase(),
                    d           = new this.Deferred(),
                    candidates  = [
                        path + 'views/layout.*',
                        path + 'views/layouts/' + name + '.*'
                    ];

                list.push(glob(candidates).then(this.hitch(function (matches) {

                    //attach layout
                    if(matches.length > 0) {
                        route.layout = matches.pop().replace(path, '');
                    }

                    d.resolve();

                })));


            }, this);

            return all(list).then(function () {
                return routes;
            });

        },

        /**
         * Attach view script to every endpoint who has one
         *
         * @param path
         * @param routes
         */
        attachViews: function (path, routes) {

            //loop through each rout and glob for candidates
            var list = [];

            _.each(routes, function (route) {

                var name        = route.controller.name.split('/').pop().toLowerCase(),
                    action      = route.action,
                    d           = new this.Deferred(),
                    candidates  = [
                        path + 'views/' + name + '.*',
                        path + 'views/' + name + '/' + action + '.*'
                    ];

                list.push(glob(candidates).then(this.hitch(function (matches) {

                    //attach layout
                    if(matches.length > 0) {
                        route.view = matches.pop().replace(path, '');
                    }

                    d.resolve();

                })));


            }, this);

            return all(list).then(function () {
                return routes;
            });


        }



    });

});