const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const users = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    userType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userType",
    },
    otp: {
        type: String,
    },
    address: [
        {
            street: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            country: {
                type: String,
            },
            pincode: {
                type: String,
            },
            landmark: {
                type: String,
            },
            phonenumber: {
                type: String,
            },
        },
    ],
    addtocart: [
        {
            type: String, 
        },
    ],
    wishlist: [
        {
            type: String, 
        },
    ],
    orders: [
        {
            productId: {
                type: String, 
            },
            quantity: {
                type: Number, 
                default: 1,
            },
            totalPrice: {
                type: Number, 
            },
        },
    ],
});

let User = mongoose.model('Users',users)
module.exports = User;

