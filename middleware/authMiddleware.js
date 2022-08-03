const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, process.env.JWT_SEC, (err, decodedToken) => {
            if (err) {
                // console.log(err.message);
                res.redirect('/auth/login')
            } else {
                // console.log(decodedToken);
                next();
            }
        })
    } else {
        res.redirect('/auth/login')
    }
};

// check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SEC, async (err, decodedToken) => {
            if (err) {
                next();
            } else {
                // console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
};

const isAdmin = (req, res, next) => {
    const user = res.locals.user;
    // console.log(user)
    if (user.isAdmin == true) {
        next();
    } else {
        req.flash('error', 'Please Log in as admin');
        res.redirect('/auth/login');
    }
};

module.exports = { isAdmin, checkUser, requireAuth };