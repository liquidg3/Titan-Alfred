define(['altair/facades/declare',
        'altair/Lifecycle',
        'lodash',
        'altair/events/Emitter',
        'altair/plugins/node!cookies'
], function (declare,
             Lifecycle,
             _,
             Emitter,
             Cookies) {


    return declare([Emitter], {

        startup: function () {

            this.on('titan:Alfred::did-receive-request').then(this.hitch('onDidReceiveRequest'));

            return this.inherited(arguments);

        },

        onDidReceiveRequest: function (e) {

            var cookies = e.get('cookies');

            if (!cookies) {

                cookies = new Cookies(e.get('request').raw(), e.get('response').raw());
                e.set('cookies', cookies);

            }


        }


    });

});
