define(['altair/facades/declare',
        'altair/plugins/node!path',
        'lodash',
        'altair/facades/hitch',
        'altair/facades/all',
        'altair/facades/glob'
], function (declare,
             pathUtil,
             _,
             hitch,
             all,
             glob) {

    return declare(null, {

        //cache controllers by name
        _controllersByName: null,
        _validExtensions: ['less', 'js', 'css'],

        constructor: function () {
            this._controllersByName = {};
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

                this.log('loading', config.name);

                //clone the config so we never mutate it
                var _config = _.clone(config);
                _config.path = path;

                //run rest of generate sequence
                this.attachControllers(path, _config.routes, controllerOptions)
                    .then(this.hitch('attachMedia', path, _config.routes))
                    .then(this.hitch('attachLayout', path, _config.routes))
                    .then(this.hitch('attachViews', path, _config.routes))
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
        attachControllers: function (path, routes, options) {

            var list = [];

            //setup routes with real callbacks
            _.each(routes, function (value, key) {

                var callbackParts   = value.action.split('::'),
                    parent,
                    action          = callbackParts[1],
                    controller       = pathUtil.join(path, callbackParts[0]),
                    controllerName  = callbackParts[0],
                    attach          = this.hitch(function (controller) {

                        if(!controller[action]) {
                            delete routes[key];
                            this.log(new Error(controller + ' is missing action ' + action + '(e) for route "' + key + '"'));
                        } else {
                            this.log('attaching route ' + key + ' to callback ' + value.action );
                            routes[key].callback    = hitch(controller, action);
                            routes[key].controller  = controller;
                            routes[key].action      = action;
                        }

                    });

                //we have already created a controller by this name
                if(this._controllersByName[controllerName]) {
                    attach(this._controllersByName[controllerName]);
                }
                //someone supplied a nexus id
                else if(callbackParts[0].search(':') > -1) {
                    parent = this.nexus(callbackParts[0]);
                    routes[key].action = hitch(parent, action);
                }
                //we have not instantiated this controller yet
                else {


                    //forge a controller
                    list.push(this.foundry(controller, options, function (Controller, options) {

                        //save the controllers name (Index, User, etc.)
                        var c            = new Controller(options);
                        c.name           = controllerName;

                        return c;

                    }).then(this.hitch(function (c) {

                       //cache
                        this._controllersByName[c.name] = c;
                        attach(c);

                    })));

                }

            }, this);

            return all(list).then(function () {
                return routes;
            });

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

            _.each(routes, function (map, uri) {

                var name        = map.controller.name.split('/').pop().toLowerCase(),
                    d           = new this.Deferred(),
                    candidates  = [
                    path + 'public/*/' + name + '.{' + this._validExtensions.join(',') + '}',
                    path + 'public/*/' + name + '/' + map.action + '.{' + this._validExtensions.join(',') + '}'
                ];

                list.push(d);
                map.media = {};

                glob(candidates).then(this.hitch(function (matches) {

                    //group all matches by file extension
                    _.each(matches, function (url) {

                        var ext = url.split('.').pop();

                        if(!map.media[ext]) {
                            map.media[ext] = [];
                        }

                        map.media[ext].push(url.replace(path, ''));

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

            _.each(routes, function (map, uri) {

                var name        = map.controller.name.split('/').pop().toLowerCase(),
                    d           = new this.Deferred(),
                    candidates  = [
                        path + 'views/layout.*',
                        path + 'views/layouts/' + name + '.*'
                    ];

                list.push(glob(candidates).then(this.hitch(function (matches) {

                    //attach layout
                    if(matches.length > 0) {
                        map.layout = matches.pop().replace(path, '');
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

            _.each(routes, function (map, uri) {

                var name        = map.controller.name.split('/').pop().toLowerCase(),
                    action      = map.action,
                    d           = new this.Deferred(),
                    candidates  = [
                        path + 'views/' + name + '.*',
                        path + 'views/' + name + '/' + action + '.*'
                    ];

                list.push(glob(candidates).then(this.hitch(function (matches) {

                    //attach layout
                    if(matches.length > 0) {
                        map.view = matches.pop().replace(path, '');
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
