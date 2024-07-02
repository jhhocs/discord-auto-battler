require("dotenv").config({path: '.env'});

db.getSiblingDB('admin').auth(
    process.env.ADMIN_USER,
    process.env.ADMIN_PASSWORD
);

db.createUser(
    {
        user: process.env.USER,
        pwd: process.env.PASSWORD,
        roles: [
            {
                role: "readWrite",
                db: process.env.DATABASE_NAME
            }
        ]
    }
);