const Users = require('../db/model/users');
const { success_function, error_function } = require('../utils/responsehandler');
const bcrypt = require('bcrypt');
const UserType = require("../db/model/userType")


//user listing for admin
// exports.getUsers = async function (req, res) {
//     try {
//         let users = await Users.find(); // Fetch users from the database

//         // If no users are found, return a 404 response
//         if (!users.length) {
//             return res.status(404).send({
//                 success: false,
//                 statuscode: 404,
//                 message: "No users found.",
//             });
//         }

//         // Return the users with a success response
//         return res.status(200).send({
//             success: true,
//             statuscode: 200,
//             data: users,
//         });

//     } catch (error) {
//         console.error("Error fetching users:", error); // Log the error for debugging
//         return res.status(400).send({
//             success: false,
//             statuscode: 400,
//             message: "Internal server error.",
//         });
//     }
// };