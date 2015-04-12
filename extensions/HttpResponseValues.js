define(['altair/facades/declare',
        'altair/cartridges/extension/extensions/_Base',
        'altair/Deferred',
        'altair/plugins/node!path',
        'altair/facades/mixin',
        'altair/facades/hitch'],

    function (declare,
              _Base,
              Deferred,
              pathUtil,
              mixin,
              hitch) {

        return declare([_Base], {

            name: 'entity-http-response-values',
            _handles: ['entity'],
            extend: function (Module) {

                Module.extendOnce({
                    getHttpResponseValues: function (event, options, config) {

                        var _options = mixin({
                            '*': { request: event.get('request') }
                        }, options || {}),
                            _config = mixin({ methods: ['toHttpResponseValue', 'toDatabaseValue', 'toJsValue']}, config || {});

                        return this.getValues(_options, _config);

                    }
                });

                return this.inherited(arguments);
            }

        });


    });