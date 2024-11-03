// In authRouter.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const accessControl = require('../utils/access-control').accessControl;

function setAccessControl(access_types) {
    return (req, res, next) => {
        accessControl(access_types, req, res, next);
    };
}

router.post('/users',authController.signup);
router.post('/login', setAccessControl("*"),authController.login);

module.exports = router; // Make sure to export the router
