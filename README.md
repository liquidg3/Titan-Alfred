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