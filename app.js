const express = require("express");
const path = require('path')
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config({ path: './.env'});

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,                 // IP address if you have a server ip
    user: process.env.DATABASE_USER,                  // xamp default user => renames in .env file
    password: process.env.DATABASE_PASSWORD,         // xamp  default password
    database: process.env.DATABASE              // created database (nodejs-login) => changed to process.env.DATABASE because of .env file (for security)
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));




// Parse URL-encoded bodies (as sent by HTML forms) Grabbing data from forms
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());



app.set('view engine', 'hbs');

db.connect( (error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MYSQL Connected...")
    }
})

// Define Router
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
    console.log("Server started on Port 5000");
})