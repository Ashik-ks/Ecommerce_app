const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

let products = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    sku: { type: String, unique: true },
    brand: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    currency: { type: String, default: "USD" },
    stockQuantity: { type: Number, required: true },
    stockStatus: { type: String, enum: ["in stock", "out of stock", "backordered"] },
    images: [{ type: String }],
    weight: { type: Number },
     
})

let Product = mongoose.model('products',products)
module.exports = Product;