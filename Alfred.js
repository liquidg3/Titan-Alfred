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
             _HasAdaptersMixin) {

    return declare([_HasAdaptersMixin], {

        startup: function (options) {

            var _options = options || this.options;

            //of no adapter was passed to startup, lets set one now. if one was passed, it's already set for us
            //(meaning we don't need to have an 'else,' nor do we mutate options)
            if(!_options || !_options.selectedAdapter) {
                this.set('selectedAdapter', 'adapters/Express3');
            }

            return this.inherited(arguments);

        },

        execute: function () {

            var a = this.get('selectedAdapter');

            if(a) {
                //startup the server
                a.startup().then(hitch(a, 'execute')).otherwise(function (err) {
                    console.dir(err);
                });

            }


            return this.inherited(arguments);
        }

    });
});