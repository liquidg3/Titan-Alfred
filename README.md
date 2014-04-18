# Alfred

A super simple, super thin module designed to provide a simple MVC architecture for web apps in Altair using express.

## Configuring routes
Create an /path/to/any/directory and drop this routes.json into it.

```json
{
    "name": "Site Name",
    "domain": "domain.com",
    "description" "A sweet website!",
    "routes": {
        "/": {
            "callback": "controllers/Index::index",
            "title": "Homepage",
            "layout": "front"
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
        - css
        - less
            - index.less
            - admin
                - dashboard.less ( admin layout dashboard specific stylesheet )
            - layouts
                - front.less ( all front layout )
                - user.less
                - admin.less
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