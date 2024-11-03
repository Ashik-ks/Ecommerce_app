const Users = require('../db/model/users');
const Product = require('../db/model/products')
const { success_function, error_function } = require('../utils/responsehandler');
const bcrypt = require('bcrypt');
const UserType = require("../db/model/userType")


exports.getProducts = async function (req, res) {
    try {
     
        let products = await Product.find();
        console.log("products : ",products)

        if(products){
            return res.status(200).send(success_function({
                success: true,
                statuscode: 200,
                data : products,
                message: "All Products getted",
            }));
        }
        else{
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Products not getting",
            }));
        }
        
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(400).send(error_function({
            success: false,
            statuscode: 400,
            message: "Internal server error.",
        }));
    }
};

exports.getSingleProduct = async function (req, res) {
    try {
        let _id = req.params.id;

        if (_id) {
            let product = await Product.findOne({ _id });

            if (product) {
                return res.status(200).send(success_function({
                    success: true,
                    statuscode: 200,
                    data: product,
                    message: "Product retrieved successfully.",
                }));
            } else {
                return res.status(404).send(error_function({
                    success: false,
                    statuscode: 404,
                    message: "Product not found.",
                }));
            }
        } else {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Product ID is required.",
            }));
        }
        
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).send(error_function({
            success: false,
            statuscode: 500,
            message: "Internal server error while fetching product.",
        }));
    }
};





