const mongoose = require('mongoose')
const bcrypt = require('bcrypt');



    const products = new mongoose.Schema({
        name: { 
            type: String, 
            required: true, 
            trim: true 
        },
        description: { 
            type: String, 
            required: true, 
            trim: true 
        },
        category: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Category', 
            required: true 
        }, // Reference to Category
        subcategory: { 
            type: String, 
            required: true 
        }, // Name of the selected subcategory
        item: { 
            type: String, 
            required: true 
        }, // Name of the selected item
        brand: { 
            type: String, 
            trim: true 
        },
        price: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        discountPrice: { 
            type: Number, 
            min: 0, 
            validate: {
                validator: function(value) {
                    return value < this.price; // Discounted price should be less than original price
                },
                message: 'Discount price must be less than the original price'
            }
        },
        currency: { 
            type: String, 
            default: "USD", 
            enum: ["USD", "EUR", "GBP", "INR", "AUD"] 
        },
        stockQuantity: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        stockStatus: { 
            type: String, 
            enum: ["in stock", "out of stock", "backordered"], 
            default: "in stock" 
        },
        images: { type: [String], required: true }, 
        weight: { 
            type: Number, 
            min: 0 
        }, // Weight of the product
        sellerId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        }, // Reference to the seller's User ID
    }, { 
        timestamps: true 
    }); // Automatically adds createdAt and updatedAt fields
    

let Product = mongoose.model('products',products)
module.exports = Product;