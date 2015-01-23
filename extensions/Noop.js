define(['altair/facades/declare',
        'altair/cartridges/extension/extensions/_Base'],

    function (declare,
              _Base) {

        return declare([_Base], {

            name: 'controller-noop',
            _handles: ['controller'],
            extend: function (Module) {

                Module.extendOnce({
                    noop: function (e) {

                        return e.get('view') ? e.get('view').render() : 'No View Found';

                    }
                });

                return this.inherited(arguments);
            }

        });


    });