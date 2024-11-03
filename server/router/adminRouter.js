// In authRouter.js
const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const accessControl = require('../utils/access-control').accessControl;

function setAccessControl(access_types) {
    return (req, res, next) => {
        accessControl(access_types, req, res, next);
    };
}

router.get('/users',adminController.getUsers);

module.exports = router; // Make sure to export the router