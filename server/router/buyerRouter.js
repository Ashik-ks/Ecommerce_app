// In authRouter.js
const express = require('express');
const router = express.Router();
const buyerController = require('../controller/buyerController');
const accessControl = require('../utils/access-control').accessControl;

function setAccessControl(access_types) {
    return (req, res, next) => {
        accessControl(access_types, req, res, next);
    };
}

router.get('/user/:id', buyerController.getSingleuser);
router.get('/category', buyerController.getCategory);
router.put('/addaddress/:id', buyerController.addAddress);
router.put('/updateaddress/:id/:index', buyerController.updateaddress);
router.delete('/deleteaddress/:id/:index', buyerController.deleteaddress);
router.delete('/deleteuser/:id', buyerController.deleteuser);





module.exports = router; // Make sure to export the router