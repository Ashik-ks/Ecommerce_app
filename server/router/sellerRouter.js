const express = require("express");
const router = express.Router();
const sellerController = require('../controller/sellerController');
const accessControl = require("../utils/access-control").accessControl;

// Middleware to set access control
function setAccessControl(access_types) {
    return (req, res, next) => {
        accessControl(access_types, req, res, next);
    };
}

router.post('/addproducts', setAccessControl("2"), sellerController.addProduct);
router.get('/getsellerproduct/:id', setAccessControl("2"), sellerController.getSellerProducts);





module.exports = router;
