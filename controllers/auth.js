const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require ('util');
const expressValidator = require('express-validator');





const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,                 // IP address if you have a server ip
    user: process.env.DATABASE_USER,                  // xamp default user => renames in .env file
    password: process.env.DATABASE_PASSWORD,         // xamp  default password
    database: process.env.DATABASE              // created database (nodejs-login) => changed to process.env.DATABASE because of .env file (for security)
});

                            // **********  Login Form  ***********

exports.login = async (req, res) => {
    try {
        const {email, password,} = req.body;

        if( !email || !password) {
            return res.status(400).render('login', {
                message: 'Please Provide an Email and Password'
            }) 
        } 

                         // *********   Check Database for Correct Login Details   **********

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(results);
    
            if( !results || !(await bcrypt.compare(password, results[0].password)) ) {
                res.status(401).render('login', {
                    message: 'Email or Password is Incorrect'
                }) 
            }else {   
                const id = results[0].id;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN 
                });

                console.log("The token is: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true 
                }

                res.cookie('jwt', token, cookieOptions );
                res.status(200).redirect("/profile");
                
 
            }
    
        }) 

        

    } catch (error) {
        console.log(error);
    }
    }

    
                    // ************    Register User    ************ //

exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;


    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {


        if(error) {
            console.log(error);
        }

        if( results.length > 0) {
            return res.render('register', {
                message: 'That email is already registered'
            })
        }else if( password !== passwordConfirm ) {
            return res.render('register', {
                message: 'Passwords Do Not Match'
            });

        
        
        
        X
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) => {
            if(error) {
                console.log(error);
            }else {
                return res.render('register', {
                    message: 'User Registered'
                });
            }
        } )
  

    });

    //res.send("Form Submitted")
}


    // *************   Check to see if user is logged in already  *******************
exports.isLoggedIn = async (req, res, next) => {
    console.log(req.cookies);
    if(req.cookies.jwt) {
        try {
                    // Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            console.log(decoded);

                    // Check if user still exists
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
            console.log(result);

            if(!result) {
                return next();
            }

            req.user = result[0];
            return next();
            });
        } catch (error) {
            return next();
            
        }
    } else{
        next();                      // renders profile page, next after =>
    }                               //  (pages.js) router.get('/profile', authController.isLoggedIn, (req, res)=>                                      
}     


            // *********** logout user and remove cookie *************
    exports.logout = async (req, res,) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2*1000),
        httpOnly: true
    });

    res.status(200).redirect('/');
}

 