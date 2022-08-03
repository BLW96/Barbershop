const User = require('../models/User');
const jwt = require('jsonwebtoken');

/*
 * HANDLE ERRORS FUNCTION
 */

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { username: '', email: '', password: '' };

    // incorrect email
    if (err.message === 'Incorrect Email') {
        errors.email = 'that email is not registered';
    }

    // incorrect password
    if (err.message === 'Incorrect Password') {
        errors.password = 'that password is incorrect';
    }

    // duplicate error code
    if (err.code === 11000) {
        errors.email = 'that email is already registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
};

/*
 * CREATING A TOKEN 
 */

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SEC, {
        expiresIn: maxAge
    });
};


/*
 * GET SIGNUP PAGE ROUTE
 */

module.exports.signup_get = (req, res) => {
    res.render('auth/signup_page', { title: 'Signup Page' });
};

/*
 * GET SIGNUP PAGE ROUTE
 */

module.exports.login_get = (req, res) => {
    res.render('auth/login_page', { title: 'Login Page' });
};

/*
 * POST CREATE USER ROUTE
 */

module.exports.signup_post = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.create({ username, email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }

};

/*
 * POST LOGIN USER ROUTE
 */

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }

};

/*
 * GET LOGOUT USER ROUTE
 */

module.exports.logout_get = async (req, res) => {
    // replace cookie with blank value '' => delete the token 
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');

};