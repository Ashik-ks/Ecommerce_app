const User = require('../db/model/users');
const Product = require('../db/model/products');
const { success_function, error_function } = require('../utils/responsehandler');
const UserType = require("../db/model/userType");
const Category = require('../db/model/category');
const fileUpload = require('../utils/file-upload').fileUpload
const mongoose = require('mongoose');




// add products
exports.addProduct = async function (req, res) {
    try {
        const body = req.body;
        console.log("body : ", body);

        // Validate input
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Invalid body. Please provide product details.",
            }));
        }

        // Required fields
        const requiredFields = ['name', 'description', 'price', 'category', 'stockQuantity'];
        console.log("requirefirlds : ", requiredFields);
        const missingFields = requiredFields.filter(field => !body[field]);
        console.log("missingfield : ", missingFields);

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
            console.log("stock : ", body.stockQuantity);
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Stock quantity must be a non-negative integer.",
            }));
        }

        // Validate category, subcategory, and item
        const validCategory = await Category.findOne({ name: body.category });
        console.log("validCategory ", validCategory);
        if (!validCategory) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: "Invalid category provided.",
            }));
        }

        // Check if the subcategory exists in the category's subcategories
        const validSubcategory = validCategory.subcategories.some(subcat => subcat.name === body.subcategory);
        if (!validSubcategory) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: `Subcategory "${body.subcategory}" not found in category "${body.category}".`,
            }));
        }

        // Check if the item exists in the selected subcategory
        const selectedSubcategory = validCategory.subcategories.find(subcat => subcat.name === body.subcategory);
        const validItem = selectedSubcategory.items.some(item => item.name === body.item);
        console.log("validitem : ", validItem);
        if (!validItem) {
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message: `Item "${body.item}" not found in subcategory "${body.subcategory}".`,
            }));
        }

        // Handle image upload
        let imagePaths = [];
        if (body.images && Array.isArray(body.images)) {
            for (let i = 0; i < body.images.length; i++) {
                const base64Pattern = /^data:image\/(png|jpeg|jpg|webp);base64,/;
                if (!base64Pattern.test(body.images[i])) {
                    return res.status(400).send(error_function({
                        success: false,
                        statuscode: 400,
                        message: "Invalid image format. Please provide valid base64 encoded images.",
                    }));
                }

                try {
                    const imagePath = await fileUpload(body.images[i], "Products");
                    imagePaths.push(imagePath);  // Store the path, not base64 data
                } catch (error) {
                    console.error("Image upload failed:", error);
                    return res.status(500).send(error_function({
                        success: false,
                        statuscode: 500,
                        message: "Image upload failed. Please try again.",
                    }));
                }
            }
        }

        // Create the product with the valid category ObjectId
        const newProduct = new Product({
            ...body,
            category: validCategory._id,  // Use the ObjectId from the category
            images: imagePaths  // Store image paths
        });
        console.log("newproduct : ", newProduct);

        await newProduct.save();

        return res.status(201).send(success_function({
            success: true,
            statuscode: 201,
            message: "Product added successfully",
            data: newProduct,
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

// fetch all products of seller
exports.getSellerProducts = async function (req, res) {
    try {
        let id = req.params.id; // Get seller's ID from request parameters

        // Fetch products belonging to the seller
        let products = await Product.find({ sellerId: id });
        console.log("products : ",products)

        // Check if products are found
        if (!products || products.length === 0) {
            return res.status(404).send({
                success: false,
                statusCode: 404,
                message: "No products found for this seller.",
            });
        }

        // Respond with the seller's products
        return res.status(200).send({
            success: true,
            statusCode: 200,
            message: "Products retrieved successfully.",
            data: products,
        });
    } catch (error) {
        console.error("Error fetching seller's products:", error);
        return res.status(500).send({
            success: false,
            statusCode: 500,
            message: `Internal server error: ${error.message}`, // More detailed error message
        });
    }
};

// fetch product data to edit
exports.getProductdataedit = async function (req, res) {
   try {
        let sellerid = req.params.sellerId;
        console.log("sellerid : ", sellerid);
        let productid = req.params.productId;
        console.log("productid : ", productid);

        

        // Find the product in the Product collection using both sellerId and productId
        const product = await Product.findOne({ _id: productid, sellerId: sellerid });
        console.log("product : ",product)
        
        // Check if product exists
        if (!product) {
            return res.status(404).json({ message: 'Product not found for this seller' });
        }

        // Send the product data as a response
        res.json({ data: product });

    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ message: 'An error occurred while fetching product data' });
    }
};

//update product data
exports.editProduct = async function (req, res) {
    try {
        const productId = req.params.productId;  // Ensure URL parameter matches
        const { description, price, discountPrice, stockQuantity, images } = req.body;

        console.log("req.body: ", req.body);  // Log the incoming data

        // Validate required fields
        if (!description || !price || !stockQuantity) {
            return res.status(400).json({ success: false, message: "Required fields are missing." });
        }

        if (price <= 0 || stockQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be positive, and stock quantity must be non-negative.",
            });
        }

        // Process images if provided
        let imagePaths = [];
        if (images && Array.isArray(images)) {
            for (let i = 0; i < images.length; i++) {
                const base64Pattern = /^data:image\/(png|jpeg|jpg|webp);base64,/;

                // Validate base64 format for the image
                if (!base64Pattern.test(images[i])) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid image format. Please provide valid base64 encoded images.",
                    });
                }

                // Upload the image and get the path
                try {
                    const imagePath = await fileUpload(images[i], "Products");
                    imagePaths.push(imagePath);  // Store the path, not base64 data
                } catch (error) {
                    console.error("Image upload failed:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Image upload failed. Please try again.",
                    });
                }
            }
        }

        // Update the product with the provided fields and images (if uploaded)
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                description,
                price,
                discountPrice,
                stockQuantity,
                ...(imagePaths.length > 0 && { images: imagePaths }),  // Only update images if new images are provided
            },
            { new: true }  // Return the updated product document
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Respond with the updated product
        res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            data: updatedProduct,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};













