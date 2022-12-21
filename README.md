# Introduction 
User management service helps TDEI system to query information specific to the User management.

# Getting Started
The project is built on top of NodeJS framework. All the regular nuances for a NodeJS project are valid for this.

## System requirements
| Software | Version|
|----|---|
| NodeJS | 16.17.0|
| Typescript | 4.8.2 |

### Local setup
Step 1: Spin up Postgres server and PgAdmin dashboard for visualization. Docker need to be install on the system first before proceeding.
```docker compose up from root directory```
Step 2: Create the database tdei in the Postgresql
Step 3: Run the script init.sql under script folder. That will create table schemas in the database [One time]
Step 4: Run the script master-data.sql under script folder. This will insert the master roles, permissions, test users in the database

#### Build and Test
Follow the steps to install the node packages required for both building and running the application

1. Install the dependencies. Run the following command in terminal on the same directory as `package.json`
    ```shell
    npm install
    ```
2. To start the server, use the command `npm run start`
3. The http server by default starts with 3000 port or whatever is declared in `process.env.PORT`
4. By default `health/ping` call on `localhost:3000` gives a sample response


