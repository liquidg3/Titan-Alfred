define(['altair/facades/declare',
        'altair/plugins/node!express',
        './_Base'
], function (declare,
             express,
             _Base) {

    return declare([_Base], {


        _app:       null,
        _server:    null,
        startup: function (options) {

            this._app = express();

            this._app.get('/', function(req, res) {
               res.send('Hello World');
            });


            this._app.use(function(err, req, res, next) {
               console.error(err.stack);
                res.send(500, 'Something Broke!');
            });

            return this.inherited(arguments);

        },

        execute: function () {

            this.deferred = new this.Deferred();

            console.log('starting alfred on port', this.get('port'));

            this._app.listen(this.get('port'), function () {

            });

            return this.inherited(arguments);
        }

    });

});
