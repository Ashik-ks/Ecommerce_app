const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

let users = new mongoose.Schema({
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
            type: String, // Store only the product ID as a string
            required: true,
        },
    ],
    wishlist: [
        {
            type: String, // Store only the product ID as a string
            required: true,
        },
    ],
});

let User = mongoose.model('Users',users)
module.exports = User;

