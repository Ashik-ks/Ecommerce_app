const Users = require('../db/model/users');
const Product = require('../db/model/products')
const category = require("../db/model/category");
const { success_function, error_function } = require('../utils/responsehandler');
const bcrypt = require('bcrypt');
const UserType = require("../db/model/userType")



// getcategory 
exports.getCategory = async function (req, res) {
    try {
      let categories = await category.find();
      console.log("Categories: ", categories);
  
      return res.status(200).send(success_function({
        success: true,
        statuscode: 200,
        message: "Categories retrieved successfully", 
        data: categories
      }));
    } catch (error) {
      console.error("Error fetching categories:", error); 
  
      return res.status(400).send(error_function({
        success: false,
        statuscode: 400,
        message: "Internal server error"
      }));
    }
};

//to display single user
exports.getSingleuser = async function (req, res) {
  try {
      let _id = req.params.id;

      if (_id) {
          let user = await Users.findOne({ _id });

          if (user) {
              return res.status(200).send(success_function({
                  success: true,
                  statuscode: 200,
                  data: user,
                  message: "User retrieved successfully.",
              }));
          } else {
              return res.status(404).send(error_function({
                  success: false,
                  statuscode: 404,
                  message: "User not found.",
              }));
          }
      } else {
          return res.status(400).send(error_function({
              success: false,
              statuscode: 400,
              message: "User ID is required.",  // Updated message
          }));
      }
      
  } catch (error) {
      console.error("Error fetching user:", error);  // Log the error for debugging
      return res.status(500).send(error_function({
          success: false,
          statuscode: 500,
          message: "Internal server error while fetching user.",
      }));
  }
};


//to add address for user
exports.addAddress = async function (req, res) {
    try {
        const id = req.params.id;
        const { street, city, state, country, pincode, landmark,phonenumber } = req.body;

        if (!id || !street || !city || !state || !country || !pincode || !landmark ||!phonenumber) {
            return res.status(400).send({
                success: false,
                statuscode: 400,
                message: "All address fields are required.",
            });
        }

        // Add address to the user's address array
        const updateUser = await Users.updateOne(
            { _id: id },
            {
                $push: {
                    address: { street, city, state, country, pincode, landmark,phonenumber },
                },
            }
        );

        if (updateUser.modifiedCount > 0) {
            return res.status(200).send({
                success: true,
                statuscode: 200,
                message: "Address added successfully.",
            });
        } else {
            return res.status(404).send({
                success: false,
                statuscode: 404,
                message: "User not found.",
            });
        }
    } catch (error) {
        console.error("Error adding address:", error);
        return res.status(500).send({
            success: false,
            statuscode: 500,
            message: "Internal server error.",
        });
    }
};

//  to handle address update
exports.updateaddress = async function (req, res) {
    try {
        const { id, index } = req.params; // Get user ID and address index
        const updatedAddress = req.body;  // Get updated address data from the request body

        // Find the user by ID
        let user = await Users.findOne({ _id: id });
        if (user) {
            // Update the address at the specified index
            user.address[index] = updatedAddress;

            // Save the updated user data to the database
            await user.save();

            res.json({ success: true, message: 'Address updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ success: false, message: 'Error updating address' });
    }
};

// to delete address
exports.deleteaddress = async function (req, res) {
    try {
        const { id, index } = req.params; // Get user ID and address index
        

        // Find the user by ID
        let user = await Users.findOne({ _id: id });
        console.log(user, "user")

        if (user) {
            // Ensure the index is valid and within bounds
            if (index >= 0 && index < user.address.length) {
                // Remove the address from the array
                user.address.splice(index, 1);

                // Save the updated user object
                await user.save();

                // Send success response
                res.status(200).json({
                    success: true,
                    message: "Address deleted successfully",
                });
            } else {
                // If the index is out of bounds
                res.status(400).json({
                    success: false,
                    message: "Invalid index provided",
                });
            }
        } else {
            // If the user is not found
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
    } catch (error) {
        console.error("Error deleting address:", error);
        // Send error response
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the address",
        });
    }
};


// to delete user 
exports.deleteuser = async function (req, res) {
    try {
        // Get the user ID from the request parameters
        const id = req.params.id;

        // Attempt to delete the user by their ID
        const result = await Users.deleteOne({ _id: id });

        // Check if a user was actually deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Send success response if the user is deleted
        res.status(200).json({
            success: true,
            message: "User deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        // Send an error response if something goes wrong
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the user.",
        });
    }
};







  



