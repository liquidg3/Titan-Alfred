define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/plugins/node!express',
        'altair/plugins/node!http',
        './_Base'
], function (declare,
             hitch,
             express,
             http,
             _Base) {

    return declare([_Base], {

        _app:       null,
        _server:    null,
        startup: function (options) {

            this._app = express();

            this._app.get('/', function(req, res) {
               res.send('Hello World');
            });

            this._app.use(hitch(this, function(err, req, res, next) {
                this.module.log(err);
                res.send(500, 'Something Broke!');
            }));


            return this.inherited(arguments);

        },

        execute: function () {

            this.deferred = new this.Deferred();

            this.module.log('starting alfred on port ' + this.get('port'));

            try {

                this._server = http.createServer(this._app);
                this._server.on('error', hitch(this, function (err) {
                    this.module.log(err);
                    this.deferred.reject(err);
                }));

                this._server.listen(this.get('port'));

            } catch (e) {
                this.module.log(e);
                this.deferred.reject(e);
            }

            return this.inherited(arguments);
        }

    });

});
