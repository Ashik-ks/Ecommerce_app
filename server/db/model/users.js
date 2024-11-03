const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

let users = new mongoose.Schema({
    fullname: {
        type :String,
        // required : true,
    },
    email: {
        type :String,
        // required : true,
    },
    password: {
        type :String,
        // required : true,
    },
    phonenumber: {
        type :String,
        // required : true,
    },
    address: {
        street: {
            type: String,
            // required: true,
        },
        city: {
            type: String,
            // required: true,
        },
        state: {
            type: String,
            // required: true,
        },
        country: {
            type: String,
            // required: true,
        },
        pincode: {
            type: String,
            // required: true,
        },
    },
    userType : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "userType" 
    },
    // password_token : {
    //     type:String,
    // }

     
})

let User = mongoose.model('Users',users)
module.exports = User;