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

            var module      = this.module,
                Theme       = this.Theme,
                View        = this.View,
                renderer    = module.nexus('liquidfire:Onyx');

            //loop through each route
            _.each(app.routes, function (route, path) {

                //set the path callback
                this._app.all(path, this.hitch(function (req, res) {

                    var layout  = route.layout,
                        theme   = layout ? new Theme(app.path, route.layout, renderer, route) : undefined,
                        view    = route.view ? new View(app.path + route.view, renderer) : undefined;

                    //emit the event, then pass it to the controller
                    module.emit('did-receive-request', { //a request was received, create an event
                        path:       path,
                        request:    req,
                        response:   res,
                        theme:      theme,
                        view:       view
                    }).then(function (e) {

                        return when(route.callback(e));

                    }).then(function (results) {

                        return module.emit('will-send-response', {
                            body:     results,
                            path:     path,
                            request:  req,
                            response: res,
                            theme:    theme,
                            view:     view
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
                            body:     body,
                            path:     path,
                            request:  req,
                            response: res
                        });

                    }).otherwise(this.hitch('onError'));


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
