define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin',
        'altair/mixins/_AssertMixin',
        'altair/plugins/node!fs',
        'lodash'
], function (declare,
             _DeferredMixin,
             _AssertMixin,
             fs,
             _) {

    return declare([_DeferredMixin, _AssertMixin], {


        forge: function (values) {

            var dfd = new this.Deferred(),
                from = this.parent.resolvePath('templates/web'),
                moduleConfig,
                devModuleConfig;


            dfd.progress('forging new website...');
            values.name = 'webapp';

            dfd.progress('forging new altair app.');

            //first forge an app
            this.parent.forge('altair:TheForge/models/App').then(function (app) {

                return app.forge(values.destination, values).step(function (step) {

                    dfd.progress(step.message, step.type);

                }.bind(this));

            }.bind(this)).then(function (results) {

                dfd.progress('app forged, configuring modules.json');

                //get the database config so we can modify it
                moduleConfig = _.where(_.flatten(results), function (obj) {
                    return obj.file === 'modules.json';
                })[0];

                devModuleConfig = _.where(_.flatten(results), function (obj) {
                    return obj.file === 'modules-dev.json';
                })[0];

                return this.all({
                    default:    this.parseConfig(moduleConfig.to),
                    dev:        this.parseConfig(devModuleConfig.to)
                });

            }.bind(this)).then(function (configs) {

                var all = [];


                if (!configs['default']['titan:Alfred']) {

                    dfd.progress('no titan:Alfred block exists, creating now.');

                    configs['default']['titan:Alfred'] = {
                        '$ref': './alfred.json'
                    };

                    all.push(this.promise(fs, 'writeFile', moduleConfig.to, JSON.stringify(configs.default, null, 4)));


                } else {

                    dfd.progress('titan:Alfred block already exists, skipping config.');
                }

                if (!configs.dev['titan:Alfred']) {

                    dfd.progress('no titan:Alfred dev block exists, creating now.');

                    configs.dev['titan:Alfred'] = {
                        '$ref': './alfred-dev.json'
                    };

                    all.push(this.promise(fs, 'writeFile', devModuleConfig.to, JSON.stringify(configs.dev, null, 4)));


                } else {

                    dfd.progress('titan:Alfred dev block already exists, skipping config.');
                }


                return this.all(all);


            }.bind(this)).then(function () {

                dfd.progress('app forge and configuration complete, forging site');

                return this.parent.forge('altair:TheForge/models/Copier');

            }.bind(this)).then(function (copier) {

                return copier.execute(from, values.destination, values).step(function (step) {

                    dfd.progress(step.message, step.type || '');

                }.bind(this));


            }.bind(this));

            return dfd;

        }



    });

});