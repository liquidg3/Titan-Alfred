define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/plugins/node!express',
        'altair/plugins/node!http',
        'altair/facades/when',
        'altair/events/Event',
        '../theme/Theme',
        '../theme/View',
        'lodash',
        './_Base'
], function (declare,
             hitch,
             express,
             http,
             when,
             Event,
             Theme,
             View,
             _,
             _Base) {

    return declare([_Base], {

        _app:       null,
        _server:    null,
        Theme:      Theme,
        View:       View,
        startup: function (options) {

            var _options = options || this.options || {};

            //no routes, no good
            if(!_options.routes) {
                throw new Error('every web server needs routes.');
            }

            //dependency injection
            if(_options.Theme) {
                this.Theme = _options.Theme;
            }

            if(_options.View) {
                this.View = _options.View;
            }

            //create express app
            this._app = express();

            //configure express
            this.configureApp(_options);

            return this.inherited(arguments);

        },

        /**
         * Configures express using the site's app.json
         *
         * @param app fully populated app.json
         * @returns {alfred.strategies._Base}
         */
        configureApp: function (app) {

            this._app.use('/public', express.static(app.path + 'public'));

            var module      = this.parent,
                Theme       = this.Theme,
                View        = this.View,
                renderer    = module.nexus('liquidfire:Onyx');

            //loop through each route
            _.each(app.routes, function (route, url) {

                //set the path callback
                this._app.all(url, this.hitch(function (req, res) {

                    var _route  = route,
                        layout  = _route.layout,
                        theme   = layout ? new Theme(app.path, _route.layout, renderer, _route) : undefined,
                        view    = _route.view && _.isString(_route.view) ? new View(app.path + _route.view, renderer) : _route.view;

                    //emit the event, then pass it to the controller
                    module.emit('did-receive-request', { //a request was received, create an event
                        url:        url,
                        request:    req,
                        response:   res,
                        theme:      theme,
                        route:      _route,
                        view:       view,
                        controller: _route.controller,
                        callback:   _route.callback,
                        routes:     app.routes
                    }).then(function (e) {

                        return when(e.get('callback')(e));

                    }).then(function (results) {

                        return module.emit('will-send-response', {
                            body:       results,
                            url:        url,
                            request:    req,
                            response:   res,
                            theme:      theme,
                            route:      _route,
                            view:       view,
                            routes:     app.routes
                        });

                    }).then(function (e) {

                        var body = e.get('body'),
                            theme;

                        //if there is a theme, set its body and render it
                        if(e.get('theme')) {

                            body = e.get('theme').setBody(body).render();

                        }
                        //straight passthrough of results if no theme
                        else {

                            body = e.get('body');

                        }

                        return when(body);


                    }).then(function (body) {

                        res.send(body);

                        return module.emit('did-send-response', {
                            body:       body,
                            path:       url,
                            request:    req,
                            response:   res,
                            route:      _route,
                            routes:     app.routes
                        });

                    }).otherwise(this.hitch(function (err) {
                          this.onError(err, res);
                    }));


                }));


            }, this);


            return this;

        },

        onError: function (err, response) {

            this.log(err);

            if(response) {
                response.send(err.stack);
            }


        },

        execute: function () {

            this.deferred = new this.Deferred();

            this.log('starting alfred on port ' + this.get('port'));

            try {

                this._server = http.createServer(this._app);
                this._server.on('error', hitch(this, function (err) {
                    this.onError(err);
                    this.deferred.reject(err);
                }));

                this._server.listen(this.get('port'));

            } catch (e) {
                this.log(e);
                this.deferred.reject(e);
            }

            return this.inherited(arguments);
        }

    });

});
