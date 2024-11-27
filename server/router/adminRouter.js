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

// router.get('/users',setAccessControl("1"),adminController.getUsers);
router.get('/count',setAccessControl("1"),adminController.getCount);

module.exports = router; // Make sure to export the router