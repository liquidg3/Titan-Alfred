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

            name: 'widget-schema',
            _foundry: null,
            _handles: ['widget'],

            extend: function (Module) {

                Module.extendOnce({
                    schemaPath: 'configs/schema'
                });

                return this.inherited(arguments);
            }

        });


    });