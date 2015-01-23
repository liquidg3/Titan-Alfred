define(['altair/facades/declare', 'lodash'], function (declare, _) {

    return declare(null, {

        _req:        null, //the native express request (will need to be decoupled in the future)
        _overrides:  {},
        constructor: function (req) {
            this._req = req;
        },

        get: function (name, defaultValue) {

            var v = _.has(this._overrides, name) ? this._overrides[name] : this._req.param(name);

            //check post
            if (_.isUndefined(v)) {
                v = this._req.body[v];
            }

            //get against raw request
            if (_.isUndefined(v)) {
                v = this._req.get(name);
            }

            //fallback to default
            if (_.isUndefined(v)) {
                v = defaultValue;
            }

            return v;
        },

        /**
         * Will return something like: localhost:8080
         *
         * @returns {*}
         */
        host: function () {
            return this._req.get('host');
        },

        /**
         * A little more useful than host(): http://localhost:8080
         *
         * @returns {string}
         */
        hostWithProtocol: function () {
            return this._req.protocol + '://' + this._req.get('host');
        },

        /**
         * All POSTed parameters
         * @returns {body}
         */
        post: function () {
            return this._req.body;
        },

        /**
         * The query string of the requested url
         * @returns {*}
         */
        query: function () {
            return this._req.query;
        },

        set: function (name, value) {

            this._overrides[name] = value;

            return this;

        },

        raw: function () {
            "use strict";
            return this._req;
        },

        isXhr: function () {
            return this._req.xhr;
        },

        method: function () {
            return this._req.method;
        },

        header: function (named, defaultValue) {

            if(named) {
                named = named.toLowerCase();
            }

            return _.has(this._req.headers, named) ? this._req.headers[named] : defaultValue;
        }


    });

});
