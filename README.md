# Alfred

A super simple, super thin module designed to provide a simple MVC architecture for web apps in [Altair](https://github.com/liquidg3/altair)
using [expressjs](https://github.com/visionmedia/express).

As with the Altair team core values regarding Committing on a convention, Alfred uses [Consolodate.js](https://github.com/visionmedia/consolidate.js/)
( can be swapped out to meet your needs ). Consolodate supports a vast number of template engines that all of the
hipsters can fight over which one is better, while they do that we can continue to make tomorrow more productive than today.


## Creating your first site

```bash
$ cd path/to/any/dir
$ altair alfred forge
```

This will walk you through creating your first site. It's pretty simple.

## Structure
From the root directory you selected to configure your routes, you will need a few folders. For this example we are using expressjs and the [.ejs](https://github.com/visionmedia/ejs) files but the file structure will be the same.

```
- /
    - configs
        - alfred.json ( contains routes, configs, javascript, database adapter settings, node and altair dependencies )
        - alfred-dev.json ( override for your dev environment )
        - ... (there are a few more files Altair drops in for your convenience);
    - controllers
        - index.js ( controller for root page )
        - user.js
        - admin.js
    - public
        - js
            - all your js files go here
        - css
            - all your css files go here
        - less
            - guess what goes here? ... you guessed it, all of your less files go here!
    - views
        - layout.ejs ( Example Below )
        - admin
            - dashboard.ejs
        - index
            - index.ejs
            - login.ejs
        - layouts
            - admin.ejs ( view for admin layouts )
            - user.ejs
            - front.ejs
```


## Configuring routes
Once your site has been forged, you can configure alfred in 1 of 2 places.

`/path/to/site/configs/alfred.json` and `/path/to/site/configs/alfred-dev.json`

The `alfred-dev.json` config will override anything in `alfred.json`.


## Example layout.ejs
If you are using ejs you can define your main layout this way and <%- body %> will be the view you defined in the controller

```

    <!DOCTYPE html>
    <head>
        <title><%= title %></title>
        <%- css %>
    </head>

    <body class="page-body <%= bodyClass %>">
        <div class="login-container">
            <%- body %>
            <%- myCustomCode %> <!-- Compile time include tags can be setup in the render of the controller -->
        </div>
        <%- js %>
    </body>
    </html>
```

## Controller Stub
The default stub layout for a controller defining the startup and index ( on page load ) stubs, if you wish to add in your own
compile time include tags you can do so by passing it into the render of the view. In this example we are creating the
supporting myCustomCode include from the above example.

```

    define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/events/Emitter'
    ], function(declare, Lifecycle, Emitter) {

        return declare([Lifecycle, Emitter], {
            startup: function (options) {
                return this.inherited(arguments);
            },
            index: function(e) {
                return e.get('view').render({
                    myCustomCode: "Taco Fight"
                });
            }
        });
    });

```

## Launching your web server
Now that we have all that set up....

``` bash
$ cd /path/to/site
$ altair
```

## Themes
Alfred has a construct called a `Theme`. Themes hold the `layout.ejs` and all `media` such as javascript and stylesheets.
You can check out the theme on a request by accesing the `e.get('theme')` in any request.

Anything you set on a theme's context will be available in it's layout file.

```js
onDidReceiveRequest: function (e) {

    //i'm getting the theme for the request
    var theme = e.get('theme');

    if (theme) {
        //will make `errors` and `messages` available in the theme's layout
        theme.set('errors', false)
             .set('messages', false);
    }

},
```

### Layout Files
If your in `controllers/Index.js` the layout that will be loaded is `views/layout.ejs`. All other layout files
are pulled from the `views/layouts` directory. The name of the file matches the name of the controller.

`controllers/Admin` -> `views/layouts/admin.ejs`
`controllers/User` -> `views/layouts/user.ejs`
`controllers/Manage` -> `views/layouts/manager.ejs`

### Disabling a Theme (rendering with no layout template)
If you don't want any of the theme functionality (such as its layout file, javascript, or css) you can disable
the theme for a particular route by setting `layout` to `false`. This is a good thing to do if your endpoint returns
json and you do not need a theme and its media.

alfred.json example:
```json
"options": {
    "routes": {
        "post /song": {
            "action": "controllers/Index::submitSongSuggestion",
            "layout": false
        }
    }
}
```
Now a POST request to `/song` will recieve whatever the `submitSongSuggestion` callback returns and nothing more.

## Redirecting a client
```js

/**
 * /dashboard
 *
 * User's dashboard page.
 *
 * @param e
 * @returns {string}
 */
dashboard: function (e) {

    var req = e.get('request');
    
    //redirect with default status (302)
    req.redirect('/login');
    
    //force status 301
    req.redirect(301, '/login');


},
```

## Cookies
Alfred uses [Cookies](https://www.npmjs.com/package/cookies) to add cookie support.
To start, add the following to your `package.json`:

```json
"dependencies": {
    "cookies": ">=0.5.x"
},
```

Mixin `_HasCookiesMixin` into your `App.js`

```js
define(['altair/facades/declare',
        'titan/modules/alfred/models/App',
        'titan/modules/alfred/mixins/_HasCookiesMixin'
], function (declare,
             App,
             _HasCookiesMixin) {

    return declare([App, _HasCookiesMixin], {


    });

});
```
Now in every callback you can get cookies as follows:
```js
dashboard: function (e) {

    var cookies = e.get('cookies');
    
    //see more documentation here: https://www.npmjs.com/package/cookies

},
```

## Skipping callback
If you want to render a view directly and not even bother implementing a callback in your controller, you can use the `noop` route handler.
Configure your route like this:

```json
"options": {
    "routes": {
        "/my-page": {
            "action": "controllers/Index::noop",
            "view":   "./views/index/my-page.ejs"
        }
    }
}

```
All you have to do is make sure that your view exists. All view paths are resolved relative to the root of your site.

