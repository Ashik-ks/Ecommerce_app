const Users = require('../db/model/users');
const Product = require('../db/model/products');
const { success_function, error_function } = require('../utils/responsehandler');
const UserType = require("../db/model/userType");

exports.addProducts = async function (req, res) {
    try {
        const body = req.body;

        // Validate input
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Invalid body. Please provide product details.",
            }));
        }

        // Required fields
        const requiredFields = ['name', 'description', 'price', 'category', 'sku', 'stockQuantity'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: `Missing required fields: ${missingFields.join(', ')}`,
            }));
        }

        // Validate name
        if (body.name.length < 3 || body.name.length > 100) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Product name must be between 3 and 100 characters long.",
            }));
        }

        // Validate description
        if (body.description.length < 10 || body.description.length > 500) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Description must be between 10 and 500 characters long.",
            }));
        }

        // Validate price
        if (typeof body.price !== 'number' || body.price <= 0) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Price must be a positive number.",
            }));
        }

        // Validate discountPrice
        if (body.discountPrice && (typeof body.discountPrice !== 'number' || body.discountPrice < 0)) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Discount price must be a non-negative number.",
            }));
        }

        // Validate stockQuantity
        if (typeof body.stockQuantity !== 'number' || body.stockQuantity < 0) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Stock quantity must be a non-negative integer.",
            }));
        }

        // Validate SKU
        if (body.sku.length < 3 || body.sku.length > 50) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "SKU must be between 3 and 50 characters long.",
            }));
        }

        // Check for unique SKU
        const existingProduct = await Product.findOne({ sku: body.sku });
        if (existingProduct) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "SKU must be unique. This SKU is already in use.",
            }));
        }

        // Create the product
        const product = await Product.create(body);

        return res.status(201).send(success_function({
            success: true,
            statuscode: 201,
            message: "Product added successfully",
            data: product,
        }));
        
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).send(error_function({
            success: false,
            statuscode: 500,
            message: "Internal server error.",
        }));
    }
};





