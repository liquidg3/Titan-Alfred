define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/mixins/_AssertMixin',
        'apollo/_HasSchemaMixin',
        'altair/plugins/config!./schema.json'
], function (declare,
             Lifecycle,
             _AssertMixin,
             _HasSchemaMixin,
             schema) {

    return declare([Lifecycle, _HasSchemaMixin, _AssertMixin], {
        _schema: schema,
        appConfig: null,
        startup: function (options) {

            if (!this.appConfig) {
                this.appConfig = options;
            }

            return this.inherited(arguments);

        },
        http: function () {
            throw new Error('You need to implement http() on your adapter and it should return an http server.');
        },

        router: function () {
            return this.options.router;
        },

        serveStatically: function () {

        }
    });

});
