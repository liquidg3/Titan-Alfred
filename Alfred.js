/**
 * Bringing a simple MVC environment for building web apps to Altair
 *
 * @author:     Jon Hemstreet, Taylor Romero
 * @license:    MIT
 * @vendor:     titan
 * @module:     Alfred
 * @nexus:      this.nexus("titan:Alfred")
 *
 */
define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/modules/adapters/mixins/_HasAdaptersMixin'
], function (declare,
             hitch,
             Lifecycle) {

    return declare([_HasAdaptersMixin], {

        startup: function (options) {

            var _options = options || this.options;

            //of no adapter was passed to startup, lets set one now. if one was passed, it's already set for us
            //(meaning we don't have to have an else nor should you even mutate options
            if(!_options.selectedAdapter) {
                this.set('selectedAdapter', 'adapters/Express3');
            }

            return this.inherited(arguments);

        }

    });
});