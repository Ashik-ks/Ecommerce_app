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

router.get('/products',buyerController.getProducts);  //setAccessControl("3"), use if needed.
router.get('/product/:id', buyerController.getSingleProduct);


module.exports = router; // Make sure to export the router