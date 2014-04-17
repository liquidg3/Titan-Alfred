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

            return this.inherited(arguments);

        },

        execute: function () {

            return this.inherited(arguments);
        }

    });

});
