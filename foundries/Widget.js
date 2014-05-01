define(['altair/facades/declare',
    'altair/plugins/node!path',
    'lodash',
    'altair/facades/hitch'
], function (declare,
             pathUtil,
             _) {

    "use strict";

    return declare(null, {


        forge: function (vendor, route) {

            var callbackParts   = route.action.split('::'),
                controllerName  = vendor + ':*/' + callbackParts[0];

            return controllerName;
        }



    });

});
