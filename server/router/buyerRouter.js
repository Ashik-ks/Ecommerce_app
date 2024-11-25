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
router.get('/fetchitem/:id/:userid', buyerController.getitem);
router.get('/fetchcategory/:id/:userid', buyerController.getcategory);
router.get('/getallproducts/:id', buyerController.getallproduct);
router.get('/searchproducts/:id', buyerController.getSearch);
router.get('/getSingleproduct/:id', buyerController.getSingleproduct);
router.put('/addtoCart/:id/:productid',setAccessControl("2,3"),buyerController.addToCart);
router.put('/updateaddtoCart/:id/:productid',setAccessControl("2,3"),buyerController.updateAddToCart);
router.get('/getalladdtoCart/:id',setAccessControl("2,3"),buyerController.getAllAddToCart);
router.put('/addtoWishlist/:id/:productid',setAccessControl("2,3"),buyerController.addToWishlist);
router.put('/updateWishlist/:id/:productid',setAccessControl("2,3"),buyerController.updateAddToWishlist);
router.get('/getallWishlist/:id',setAccessControl("2,3"),buyerController.getAllWishlist);
router.post('/order/:id',setAccessControl("2,3"),buyerController.placeOrder);
router.post('/order/:id',setAccessControl("2,3"),buyerController.placeOrder);
router.post('/reorder/:id',setAccessControl("2,3"),buyerController.reorder);
router.post('/cancelorder/:id',setAccessControl("2,3"),buyerController.CancelOrder);
router.get('/gatAllorders/:id',setAccessControl("2,3"),buyerController.getOrderedProducts);


module.exports = router; // Make sure to export the router