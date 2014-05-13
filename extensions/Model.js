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

            name: 'controller-model',
            _handles: ['controller'],
            extend: function (Module) {

                Module.extendOnce({
                    modelPath: './models',
                    _models: {},
                    model: function (path, options, config) {

                        var _p = this.resolvePath(pathUtil.join(this.modelPath, path)),
                            _c = mixin({
                                type: 'model',
                                name: this.name.split('/')[0] + '/models/' + path
                            }, config || {});

                        if(this._models[path]) {
                            return this._models[path];
                        }

                        this._models[path] = this.forge(_p, options, _c);

                        return this._models[path];

                    }
                });

                return this.inherited(arguments);
            }

        });


    });