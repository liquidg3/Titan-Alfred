define(['altair/facades/declare',
        'altair/plugins/node!less',
        'altair/plugins/node!fs',
        'altair/plugins/node!path',
        'altair/plugins/node!mkdirp',
        'altair/Deferred',
        './_Base'
], function (declare,
             less,
             fs,
             pathUtil,
             mkdirp,
             Deferred,
             _Base) {

    return declare(_Base, {

        _extensions: ['less', 'css'],

        renderItem: function (item) {

            var d,
                path,
                _item = item,
                tag   = '<link rel="stylesheet" href="' + _item + '">',
                lessUrl = _item.replace('/less/', '/_compiled/').replace('.less', '.css'),
                lessTag = '<link rel="stylesheet" href="' + lessUrl  + '">';

            //compile less for now
            if(_item.search('.less') > 0) {

                path    = this._basePath + _item;
                d       = new Deferred();

                if(this.options.autoCompileLess !== true) {
                    return lessTag;
                }

                fs.readFile(path, function (err, contents) {

                    if(err) {
                        d.reject(err);
                    } else {


                        less.render(contents.toString(), {
                            paths: [ pathUtil.dirname(path) ]
                        }, function (err, results) {

                            if(err) {
                                d.reject(err);
                            } else {

                                path    = path.replace('/less/', '/_compiled/').replace('.less', '.css');

                                mkdirp(pathUtil.dirname(path), function (err) {

                                    fs.writeFile(path, results.css ? results.css : results, function (err) {

                                        if(err) {
                                            d.reject(err);
                                        } else {
                                            d.resolve(lessTag);
                                        }

                                    });

                                });


                            }
                        });

                    }

                });


            } else {
                d = tag;
            }

            return d;


        }

    });

});