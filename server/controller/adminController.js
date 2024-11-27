const Users = require('../db/model/users');
const Products = require('../db/model/products')
const UserType = require('../db/model/userType');
const { success_function, error_function } = require('../utils/responsehandler');
const bcrypt = require('bcrypt');

// get count
exports.getCount = async function (req, res) {
    try {
        // Get the total count of users
        const userCount = await Users.countDocuments();
        console.log("userCount : ", userCount);

        // Get the seller userType ID
        const sellerType = await UserType.findOne({ userType: 'Seller' });
        console.log("sellerType : ", sellerType);

        // Get the count of sellers
        const sellerCount = await Users.countDocuments({ userType: sellerType._id });
        console.log("sellerCount : ", sellerCount);

        const productCount = await Products.countDocuments()
        console.log("productCount : ",productCount)

        // Get all users
        const users = await Users.find();

        // Calculate the total number of orders from all users
        let orderCount = 0;
        users.forEach(user => {
            if (user.orders && user.orders.length) {
                orderCount += user.orders.length;
            }
        });
        console.log("orderCount: ", orderCount);

        return res.status(200).json({
            success: true,
            message: "Counts  fetched successfully",
            userCount,
            sellerCount,
            orderCount,
            productCount
        });
    } catch (error) {
        return error_function(res, error);
    }
};



// exports.getUsers = async function (req, res) {
//     try {
//         // Fetch all users and populate the 'userType' field
//         let users = await Users.find().populate('userType'); // Populate userType reference

//         // If no users are found, return a 404 response
//         if (!users.length) {
//             return res.status(404).send({
//                 success: false,
//                 statuscode: 404,
//                 message: "No users found.",
//             });
//         }

//         // Find the 'Seller' userType by matching its name
//         const sellerUserType = await UserType.findOne({ name: 'Seller' });
//         console.log(" sellerUserType: ",sellerUserType)

//         // If no 'Seller' userType is found, return an empty sellers array
//         if (!sellerUserType) {
//             return res.status(404).send({
//                 success: false,
//                 statuscode: 404,
//                 message: "No Seller user type found.",
//             });
//         }

//         // Filter users whose 'userType' matches the 'Seller' userType
//         let sellers = users.filter(user => 
//             user.userType && user.userType._id && user.userType._id.toString() === sellerUserType._id.toString()
//         );

//         console.log("Sellers:", sellers);

//         // Return both all users and sellers in the response
//         return res.status(200).send({
//             success: true,
//             statuscode: 200,
//             data: {
//                 allUsers: users,  // All users (both buyers and sellers)
//                 sellers: sellers   // Only sellers
//             },
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




