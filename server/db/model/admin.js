const mongoose = require('mongoose');
const Schema = mongoose.Schema;  // Import Schema from mongoose

const admin = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String
    },
    userType: {
        type: Schema.Types.ObjectId, // Reference to another schema
        ref: 'userType' // Refers to the 'UserType' model
    }
});

const Access = mongoose.model('admins', admin); // Capitalized and renamed the model to follow common conventions
module.exports = Access;