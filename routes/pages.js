const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// *******   Add Pages here to load  *************

router.get('/', authController.isLoggedIn, (req, res) => {
    res.render('index', {
        user: req.user
    });
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/profile', authController.isLoggedIn, (req, res)=>{   // authController.isLoggedIn => check token of user
    
    if(req.user ) {
        res.render('profile', {
            user: req.user
        });  
    }else{
        res.redirect('/login');
    }
    
})

module.exports = router;
