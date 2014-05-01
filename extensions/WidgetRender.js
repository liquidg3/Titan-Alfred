define(['altair/facades/declare',
        'altair/facades/mixin',
        'altair/cartridges/extension/extensions/_Base',
        'apollo/_HasSchemaMixin'],

    function (declare,
              mixin,
              _Base,
              _HasSchemaMixin) {

        return declare([_Base], {

            name: 'widget-render',
            _handles: ['widget'],
            extend: function (Module) {

                if(!Module.prototype.__hasWidgetRenderBeenExtended) {

                    Module.prototype.__hasWidgetRenderBeenExtended = true;


                    Module.extendBefore({
                        render: function (path, context, options, old) {

                            if(!path) {
                                path = 'views/layout.ejs';
                            }

                            if(this.getValues) {
                                context = mixin(this.getValues({}, {'methods': ['toViewValue', 'toJsValue']}), context || {});
                            }

                            return old(path, context, options);

                        }
                    });

                }

                return this.inherited(arguments);
            }

        });


    });