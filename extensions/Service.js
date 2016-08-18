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

            name: 'controller-service',
            _handles: ['controller', 'app', 'module', 'service'],
            extend: function (Module) {

                Module.extendOnce({
                    servicePath: './services',
                    service: function (named, options, config) {

                        var _p = named.search(':') === -1 ?  this.resolvePath(pathUtil.join(this.servicePath, named)) : '',
                            _c = mixin({
                                type: 'service',
                                cache: true,
                                name: this.name.split('/')[0] + '/services/' + named
                            }, config || {});

                        //if it's a nexus name, pass it off
                        if (named.search(':') > 0) {

                            var parts  = named.split('/'),
                                parent = parts.shift(),
                                _p,
                                name   = parts.pop();

                            _p = this.nexus(parent);

                            if (!_p) {
                                throw new Error('Could not resolve ' + parent);
                            }

                            return _p.service(name, options, config);

                        }

                        return this.forgeSync(_p, options, _c);

                    }
                });

                return this.inherited(arguments);
            }

        });


    });