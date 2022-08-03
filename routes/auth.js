const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


/*
 * SING UP USER PAGE
 */
router.get('/signup', authController.signup_get);

/*
 * LOGIN USER PAGE
 */
router.get('/login', authController.login_get);

/*
 * POST SING UP USER
 */
router.post('/signup', authController.signup_post);

/*
 * POST LOGIN USER
 */
router.post('/login', authController.login_post);

/*
 * LOGOUT USER
 */
router.get('/logout', authController.logout_get);

module.exports = router;
