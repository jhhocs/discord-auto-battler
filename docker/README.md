# Docker Setup for Local MongoDB Server
---
1. [Install Docker](https://www.docker.com/products/docker-desktop/)
2. [Install MongoDB Compass](https://www.mongodb.com/products/tools/compass)
3. Create a .env file in the `docker` directory following .env.sample
4. run docker-compose up --build -d mongodb
5. Using MongoDB Compass, connect to the database using the following connection URI format with the user credentials (not admin):
```
MONGODB_URI=mongodb://[username]:[userPassword]@localhost:27017/?authSource=[DatabaseName]
```
6. If this does not work, connect to the database using admin
7. Create a new DB (Matching Database name used in the `.env` in the main directory) and a Collection "guilds"
8. Click the MONGOSH tab on the very bottom of MongoDB Compass and paste the following commands:
```
use DatabaseName
```
```
db.createUser(
  {
    user: "NAME_OF_NEW_USER",
    pwd: "NEW_USER_PASSWORD",
    roles: ["readWrite"]
  }
)
```

9. Try to connect to the database with the newly created user using this URI format:
```
`MONGODB_URI=mongodb://[username]:[userPassword]@localhost:27017/?authSource=[DatabaseName]`
```