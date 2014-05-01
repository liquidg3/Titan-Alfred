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

            name: 'model',
            _handles: ['controller'],
            extend: function (Module) {

                Module.extendOnce({
                    model: function (path, options, config) {

                        var _p = this.resolvePath(pathUtil.resolve(this.dir, '..', 'models', path)),
                            d,
                            _c = mixin({
                                type: 'model',
                                name: this.name.split('/')[0] + '/models/' + path
                            }, config || {});


                        if(path[0] === '.' || path[0] === '/') {
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