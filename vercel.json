{
    "version": 2,
    "builds": [
        {
            "src": "dist/index.js",
            "use": "@vercel/node",
            "config": { "includeFiles": ["dist/**"] }
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "dist/index.js"
        }
    ]
}