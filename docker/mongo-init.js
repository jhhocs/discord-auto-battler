require("dotenv").config({path: '.env-mongo'});

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