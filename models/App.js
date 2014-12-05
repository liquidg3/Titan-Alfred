define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/mixins/_AssertMixin',
        'altair/events/Emitter',
        'lodash'
], function (declare,
             Lifecycle,
             Emitter,
             _AssertMixin,
             _) {

    return declare([Lifecycle, Emitter, _AssertMixin], {


        server: null,
        controllerFoundry: null,

        //callback stubs
        onWillExecuteServer:    function (e) {},
        onDidExecuteServer:     function (e) {},
        onDidReceiveRequest:    function (e) {},
        onWillSendResponse:     function (e) {},
        onDidSendResponse:      function (e) {},

        startup: function (options) {


            this.assert(options, 'You must pass your app model some options.');
            this.assert(options.controllerFoundry, 'Your app requires a controllerFoundry.');

            this.controllerFoundry = options.controllerFoundry;

            //setup listeners for stubbed callbacks
            this.on('titan:Alfred::will-execute-server').then(this.hitch('onWillExecuteServer'));
            this.on('titan:Alfred::did-execute-server').then(this.hitch('onDidExecuteServer'));
            this.on('titan:Alfred::did-receive-request').then(this.hitch('onDidReceiveRequest'));
            this.on('titan:Alfred::will-send-response').then(this.hitch('onWillSendResponse'));
            this.on('titan:Alfred::did-send-response').then(this.hitch('onDidSendResponse'));

            return this.inherited(arguments);



        },

        execute: function (options) {

            var _options = options || this.options,
                strategy = _options.strategy,
                alfred   = this.nexus('titan:Alfred');


            return this.emit('titan:Alfred::will-execute-app', {
                app: this,
                options: _options
            }).then(function (e) {

                _options = e.get('options');

                return alfred.forge(_options.router || 'routers/Config', _options);

            }).then(function (router) {

                _router = router;

                //generate populated routes (see strategies/README.md)
                return router.generateAppConfig({}, { parent: this });

            }.bind(this)).then(this.hitch(function (_app) {

                var _paths = {};
                //pass the newly generated routes our server strategy
                _options         = _app;
                _options.router  = _router;

                //map the vendor
                if (!_options.vendor) {
                    throw new Error('You must set a vendor in your site config.');
                }

                //include paths
                _paths[_options.vendor] = _options.path;

                require({
                    paths: _paths
                });

                //if they passed a string, assume a foundry compatible class name
                if (_.isString(strategy)) {

                    //pass to the foundry for startup
                    return alfred.forge(alfred._strategies[strategy], _options);

                }
                //if a strategy was passed
                else {

                    //just start it up
                    return strategy.startup(_options);

                }

            })).then(this.hitch(function (server) {

                this.server = server;

                return this.emit('titan:Alfred::will-execute-server', {
                    server:     server,
                    app:        this,
                    options:    _options,
                    router:     _router
                });

            })).then(this.hitch(function (e) {

                server = e.get('server');

                //execute the server
                server.execute();

                //add it to list of active servers (@TODO: Use a public API)
                alfred._activeServers.push(server);

                //let the world know we have executed
                return this.emit('titan:Alfred::did-execute-server', {
                    server: server,
                    app:    this,
                    options:_options,
                    router: _router
                });

            })).then(function (e) {

                return this.emit('titan:Alfred::did-execute-app', {
                    server: e.get('server'),
                    app:    this,
                    options:_options,
                    router: _router
                });

            }.bind(this)).then(function () {

                return this;

            }.bind(this));


        }




    });

});