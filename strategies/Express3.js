define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/plugins/node!express',
        'altair/plugins/node!http',
        'altair/plugins/node!body-parser',
        'altair/facades/when',
        '../theme/Theme',
        '../theme/View',
        '../http/Request',
        '../http/Response',
        'lodash',
        './_Base'
], function (declare,
             hitch,
             express,
             http,
             bodyParser,
             when,
             Theme,
             View,
             Request,
             Response,
             _,
             _Base) {

    return declare([_Base], {

        _app:       null,
        _server:    null,
        Theme:      Theme,
        View:       View,
        Request:    Request,
        Response:   Response,
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

            var module      = this.parent;

            this._app.use(bodyParser());

            this._app.use('/public', express.static(app.path + 'public'));

            //loop through each route
            _.each(app.routes, function (route, url) {

                var verb = 'all',
                    _url = url,
                    parts;

                if(url.search(' ') > 0) {
                    parts = url.split(' ');
                    verb  = parts[0];
                    _url  = parts[1];
                }

                //set the path callback
                this._app[verb](_url, this.hitch(function (req, res, next) {
                    this.handleRequest(app, url, route, req, res, next);
                }));


            }, this);


            return this;

        },

        /**
         * Called on every request
         *
         * @param route
         * @param _req
         * @param _res
         * @param next
         */
        handleRequest: function (app, url, route, _req, _res, next) {

            var _route  = route,
                module  = this.parent,
                renderer= module.nexus('liquidfire:Onyx'),
                req     = new this.Request(_req),
                res     = new this.Response(_res),
                layout  = _route.layout,
                theme   = layout ? new this.Theme(app.path, _route.layout, renderer, _route) : undefined,
                view    = _route.view && _.isString(_route.view) ? new this.View(app.path + _route.view, renderer) : _route.view;

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

                if(e.active) {
                    return when(e.get('callback')(e));
                } else {
                    return e.get('body');
                }


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
                if(e.get('theme') && _.isString(body)) {

                    body = e.get('theme').setBody(body).render();

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


        },

        onError: function (err, response) {

            this.log(err);

            if(response) {
                response.setStatus(500);
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
        },

        teardown: function () {

            this.log('tearing down server');
            return this.promise(this._server, 'close');

        }

    });

});
