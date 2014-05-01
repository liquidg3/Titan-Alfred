define(['altair/facades/declare',
    'altair/plugins/node!path',
    'lodash',
    'altair/facades/hitch'
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

        buildForRoute: function (path, vendor, route, options) {


            var callbackParts   = route.action.split('::'),
                controller      = pathUtil.join(path, callbackParts[0]),
                controllerName  = this.nameForRoute(vendor, route);

            return this.module.forge(controller, options, { type: 'controller', name: controllerName });


        }


    });

});
