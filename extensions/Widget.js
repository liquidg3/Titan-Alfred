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

            name: 'widget',
            _foundry: null,
            _handles: ['controller'],

            extend: function (Module) {

                Module.extendOnce({
                    widget: function (name, options, config) {

                        var _p = this.resolvePath(pathUtil.resolve(this.dir, '..', 'widgets', name.toLowerCase(), name)),
                            d,
                            _c = mixin({
                                type: 'widget',
                                name: this.name.split('/')[0] + '/widgets/' + name
                            }, config || {});


                        if(name[0] === '.' || name[0] === '/') {
                            d = new Deferred();
                            d.reject(new Error('Only local models can be loaded. No / or ../ allowed for now.'));
                            return d;
                        }


                        return this.forge(_p, options, _c);

                    }
                });

                return this.inherited(arguments);
            }

        });


    });