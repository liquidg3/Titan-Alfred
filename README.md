# Alfred

A super simple, super thin module designed to provide a simple MVC architecture for web apps in Altair using express.

## Configuring routes
Create an /path/to/any/directory and drop this app.json into it.

```json
{
    "name": "Site Name",
    "domain": "domain.com",
    "description" "A sweet website!",
    "routes": {
        "/": {
            "callback": "controllers/Index::index",
            "title": "Homepage",
            "layout": "front" /** default layout is front **/
        },
        "/users": {
            "callback": "controllers/User::index",
            "title": "Users!",
            "layout": "user"
        },
        "/user/dashboard": {
            "callback": "controllers/User::dashboard",
            "title": "Welcome to your dashboard",
            "layout": "user"
        },
        "/admin/profile/:id": {
            "callback": "controllers/Admin::profileById",
            "title": "Manage Profile",
            "layout": "admin"
        }
    }
}
```

## Structure
From the root directory you selected to configure your routes, you will need a few folders.

```
- /
    - routes.json
    - controllers
        - index.js ( controller for root page )
        - user.js
        - admin.js
    - public
        - js
            - global.js ( this will be included on every layout )
            - front ( by layout )
                - front.js ( everything in this dir will be included whenever the front layout is selectd )
        - css
        - less
            - all.less ( anything on the root level will be included in all layouts)
            - dependencies.less ( will also be included on every page )
            - front ( by layout )
                - one.less
                - two.less
                - three.less
    - views
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