# Alfred

A super simple, super thin module designed to provide a simple MVC architecture for web apps in [Altair](https://github.com/liquidg3/altair)
using [expressjs](https://github.com/visionmedia/express).

As with the Altair team core values regarding Committing on a convention, Alfred uses [Consolodate.js](https://github.com/visionmedia/consolidate.js/)
( can be swapped out to meet your needs ). Consolodate supports a vast number of template engines that all of the
hipsters can fight over which one is better, while they do that we can continue to make tomorrow more productive than today.

## Before you start
Everyone loves examples, why not show you how easy it is to set up before we get into the setup

``` bash
clone your repo and cd into that folder
$ npm install altair.io -g
$ altair thelodge package --packagePath app.json --destination home
$ altair alfred go --strategy express3 --dir . --port 8080
```

Easy right!? Lets get this party started!


## Configuring routes
Create an /path/to/any/directory and drop this app.json into it.

```json
{
    "name": "Site Name",
    "vendor" : "altair",
    "domain": "domain.com",
    "description" "A sweet website!",
     "dependencies": {
        "crypto": "0.0.3"
    },
    "altairDependencies": {
        "titan:Alfred":       ">=0.0.x"
    },
    "database":           {
        "connections": [
            {
                "path":    "altair/cartridges/database/adapters/Mongodb",
                "options": {
                    "alias":            "mongo",
                    "connectionString": "mongodb://localhost/altair"
                }
            }
        ]
    },
    "media": {
        "css":  [
            "/public/css/bootstrap.css"
        ],
        "less": [
            "/public/less/index.less"
        ],
        "js":   [
            "/public/js/jquery.js"
        ]
    },
    "routes": {
        "/": {
            "action": "controllers/Index::index",
            "layoutContext": {
                "title":     "Homepage",
                "bodyClass": "home-page"
            }
        },
        "/users": {
            "action": "controllers/User::index",
            "customParameter": "Taco Street Fight", ( You can add in extra parameters and access them in the controller by doing e.get('route').customParameter )
            "resultProps":   ["Jon", "TommyDog"], ( We can get custom arrays too! )
            "layoutContext": {
                "title":     "Users",
                "bodyClass": "user-page"
            }
        },
        "/user/dashboard": {
            "action": "controllers/User::dashboard",
            "layoutContext": {
                "title":     "Welcome to your dashboard",
                "bodyClass": "dashboard-page"
            }
        },
        "/admin/profile/:id": {
            "action": "controllers/Admin::profileById",
            "authorize": true,
            "layoutContext": {
                "title":     "Manage Profile",
                "bodyClass": "profile-page"
            }
        }
    }
}
```

## Structure
From the root directory you selected to configure your routes, you will need a few folders. For this example we are using expressjs and the [.ejs](https://github.com/visionmedia/ejs) files but the file structure will be the same.

```
- /
    - app.json ( contains routes, configs, javascript, database adapter settings, node and altair dependencies )
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

## Troubleshooting
If you do not see your files getting included properly ( css, js, etc... ) restart the alfred server
