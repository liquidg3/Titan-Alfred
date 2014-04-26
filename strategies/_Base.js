define(['altair/facades/declare',
        'altair/Lifecycle',
        'apollo/_HasSchemaMixin',
        'altair/plugins/config!./schema.json'
], function (declare,
             Lifecycle,
             _HasSchemaMixin,
             schema) {

    return declare([Lifecycle, _HasSchemaMixin], {
        _schema: schema
    });

});
