const mongoose = require('mongoose');

let usertypes = new mongoose.Schema({
    userType : {
        type :String,
        // required : true,
    },
})

module.exports = mongoose.model("userType",usertypes);