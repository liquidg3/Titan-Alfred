define(['altair/facades/declare',
        'altair/plugins/node!path',
        'lodash'
], function (declare,
             pathUtil,
             _) {

    "use strict";

    return declare(null, {


        nameForRoute: function (vendor, route) {

            var callbackParts   = route.action.split('::'),
                controllerName  = vendor + ':*/' + callbackParts[0];

            return controllerName;
        },

        forgeForRoute: function (path, vendor, route, options) {


            var callbackParts   = route.action.split('::'),
                controller      = pathUtil.join(path, callbackParts[0]),
                controllerName  = this.nameForRoute(vendor, route);

            return this.forge(controller, options, { type: 'controller', parent: null, name: controllerName, foundry: function (Class, options, config) {

                Class.extendOnce({
                    sitePath: path,
                    entityPath:     pathUtil.join(path, 'entities'),
                    modelPath:      pathUtil.join(path, 'models'),
                    widgetPath:     pathUtil.join(path, 'widgets')
                });

                return config.defaultFoundry(Class, options, config);

            } });


        }


    });

});
