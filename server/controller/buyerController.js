const Users = require('../db/model/users');
const Product = require('../db/model/products')
const category = require("../db/model/category");
const { success_function, error_function } = require('../utils/responsehandler');
const bcrypt = require('bcrypt');
const UserType = require("../db/model/userType")
const mongoose = require('mongoose');
const set_stock_template =require("../utils/email-templates/outof-stock").outOfStock;
const set_orderplace_template =require("../utils/email-templates/orderplaced").orderPlace;
const set_order_cancel_template = require("../utils/email-templates/cancel-order").cancelOrder

const sendEmail = require("../utils/send-email").sendEmail;


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

// fetch item 
exports.getitem = async function (req, res) {
    try {
        const id = req.params.id;
        const userid = req.params.userid;
        console.log("Item ID:", id);
        console.log("User ID:", userid);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                success: false,
                statuscode: 400,
                message: "Invalid item ID.",
            });
        }

        const objectId = new mongoose.Types.ObjectId(id);
        console.log("ObjectId:", objectId);

        // Fetch category data with populated subcategories and items matching the objectId
        const categoryData = await category.findOne({
            "subcategories.items._id": objectId,
        }).populate({
            path: "subcategories.items",
            match: { _id: objectId },
            select: "name _id",
        });

        console.log("Category Data:", categoryData);

        if (!categoryData) {
            return res.status(404).send({
                success: false,
                statuscode: 404,
                message: "No category found for the given item.",
            });
        }

        // Find the item in the populated subcategories
        let foundItem = null;
        let itemName = null;

        for (const subcategory of categoryData.subcategories) {
            for (const item of subcategory.items) {
                if (item._id.toString() === objectId.toString()) {
                    foundItem = item;
                    itemName = item.name;
                    console.log("Found Item:", foundItem);
                    break;
                }
            }
            if (foundItem) break;
        }

        if (!foundItem) {
            return res.status(404).send({
                success: false,
                statuscode: 404,
                message: "Item not found.",
            });
        }

        // Handle different cases for `userid`
        let productFilter = { item: { $regex: itemName, $options: "i" } };

        if (userid !== 'null' && userid !== null) {
            // Validate `userid` as a valid ObjectId if it's not 'null'
            if (!mongoose.Types.ObjectId.isValid(userid)) {
                return res.status(400).send({
                    success: false,
                    statuscode: 400,
                    message: "Invalid user ID.",
                });
            }

            const user = await Users.findById(userid);
            if (!user) {
                return res.status(404).send({
                    success: false,
                    statuscode: 404,
                    message: "User not found.",
                });
            }

            const userType = await UserType.findById(user.userType);
            if (userType && userType.userType === "Seller") {
                // If `userid` is a seller, exclude products with this sellerId
                productFilter.sellerId = { $ne: userid };
            }
        }

        // Fetch products based on the constructed filter
        const productData = await Product.find(productFilter);
        console.log("Product Data:", productData);

        if (!productData || productData.length === 0) {
            return res.status(404).send({
                success: false,
                statuscode: 404,
                message: `No products found for the item: ${itemName}`,
            });
        }

        // Return the found item and products
        return res.status(200).send({
            success: true,
            statuscode: 200,
            data: {
                item: foundItem,
                products: productData,
            },
            message: "Item and products fetched successfully.",
        });
    } catch (error) {
        console.error("Error fetching item:", error);
        return res.status(500).send({
            success: false,
            statuscode: 500,
            message: "Internal server error.",
        });
    }
};

//fetch products based on category
exports.getcategory = async function (req, res) {
    try {
        const itemId = req.params.id;
        const userid = req.params.userid; // Assuming userid is passed as a parameter

        console.log("Item ID:", itemId);
        console.log("User ID:", userid);

        // Validate itemId
        if (!itemId) {
            return res.status(400).send({
                success: false,
                statuscode: 400,
                message: "Item ID is required."
            });
        }

        // Convert itemId to Mongoose ObjectId
        const objectId = new mongoose.Types.ObjectId(itemId);

        // Find the category containing the subcategory and item
        const categoryData = await category.findOne({
            "subcategories.items._id": objectId
        }).select("name subcategories.name subcategories._id subcategories.items._id subcategories.items.name");

        if (!categoryData) {
            return res.status(404).send({
                success: false,
                statuscode: 404,
                message: "No category found for the given item."
            });
        }

        // Extract the subcategory containing the specific item
        let foundSubcategory = null;
        let foundItem = null;

        for (let subcategory of categoryData.subcategories) {
            const item = subcategory.items.find(
                item => item._id.toString() === objectId.toString()
            );
            if (item) {
                foundSubcategory = subcategory;
                foundItem = item;
                break;
            }
        }

        if (!foundSubcategory || !foundItem) {
            return res.status(404).send({
                success: false,
                statuscode: 404,
                message: "Subcategory or item not found."
            });
        }

        // Extract item names from the subcategories
        const itemNames = categoryData.subcategories.reduce((acc, subcategory) => {
            subcategory.items.forEach(item => {
                acc.push(item.name);
            });
            return acc;
        }, []);

        // Construct product filter
        let productFilter = {
            item: { $in: itemNames }
        };

        // Handle case if userid is null (buyer)
        if (userid === null) {
            // If userid is null, display all products based on item names (for buyers)
            console.log("Userid is null - Showing all products for the buyer.");
        
               

            const user = await Users.findById(userid);
            if (!user) {
                return res.status(404).send({
                    success: false,
                    statuscode: 404,
                    message: "User not found."
                });
            }

            const userType = await UserType.findById(user.userType);
            if (userType && userType.userType === "Seller") {
                // If the user is a seller, exclude products from this seller
                console.log("Userid is a seller - Excluding their products.");
                productFilter.sellerId = { $ne: userid }; // Exclude products from the seller's ID
            }
        }

        // Fetch products based on the item names and user filtering
        const products = await Product.find(productFilter);

        // Prepare the response with all subcategories and items
        const responseSubcategories = categoryData.subcategories.map(subcategory => ({
            subcategoryId: subcategory._id,
            subcategoryName: subcategory.name,
            items: subcategory.items.map(item => ({
                itemId: item._id,
                itemName: item.name
            }))
        }));

        return res.status(200).send({
            success: true,
            statuscode: 200,
            data: {
                products: products,
                itemId: categoryData.name,
                subcategories: responseSubcategories // Include subcategories for the response
            },
            message: "Subcategories, items, and products fetched successfully."
        });

    } catch (error) {
        console.error("Error fetching subcategories and items: ", error);
        return res.status(500).send({
            success: false,
            statuscode: 500,
            message: "Internal server error."
        });
    }
};

//fetch all products
exports.getallproduct = async function (req, res) {
    try {
        const id = req.params.id;
        let products;
        let user;

        if (id === 'null') {
            // If id is null, fetch all products
            products = await Product.find();
        } else {
            // Fetch user by ID
            user = await Users.findOne({ _id: id });

            if (!user) {
                return res.status(404).send({
                    success: false,
                    statuscode: 404,
                    message: "User not found",
                });
            }

            // Fetch user type to filter products based on user role
            const userType = await UserType.findOne({ _id: user.userType });

            if (!userType) {
                return res.status(404).send({
                    success: false,
                    statuscode: 404,
                    message: "User type not found",
                });
            }

            // If user is a seller, exclude their products
            if (userType.userType === 'Seller') {
                products = await Product.find({ sellerId: { $ne: id } });
            } else {
                // For buyers, fetch all products
                products = await Product.find();
            }
        }

        if (products && products.length > 0) {
            // Map to send a smaller response with just necessary fields
            const responseProducts = products.map(product => ({
                _id: product._id,
                name: product.name,
                subcategory: product.subcategory,
                price: product.price,  // assuming you want to include the price
            }));

            // Calculate the number of items in the cart for the user (if available)
            let cartCount = 0;
            if (user && user.addtocart) {
                cartCount = user.addtocart.length;
            }

            return res.status(200).send({
                success: true,
                statuscode: 200,
                responseProducts,
                allproducts: products, // Include full products if needed
                count: cartCount,  // Count of products in user's cart
                message: "Products fetched successfully",
            });
        } else {
            return res.status(404).send({
                success: false,
                statuscode: 404,
                allproducts: [],
                message: "No products found",
            });
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).send({
            success: false,
            statuscode: 500,
            message: "Error fetching products",
            error: error.message,
        });
    }
};


//get products based on search
exports.getSearch = async function (req, res) {
    try {
        let id = req.params.id;
        console.log("searchId : ", id);

        let searchproduct = await Product.findOne({ _id: id }).populate('category');
        console.log("searchproduct : ", searchproduct);

        if (searchproduct) {
            let searchitem = searchproduct.item;
            console.log("searchitem : ", searchitem);

            let searchcategory = searchproduct.category;
            console.log("searchcategory : ", searchcategory);

            let searchproductitem;
            let searchproductcategory;

            if (searchitem && searchcategory) {
                searchproductitem = await Product.find({ item: searchitem });
                console.log("searchproductitem : ", searchproductitem);

                searchproductcategory = await Product.find({ category: searchcategory });
                console.log("searchproductcategory : ", searchproductcategory);
            }

            return res.status(200).send({
                success: true,
                statuscode: 200,
                product: {
                    searchproduct,
                    searchproductitem,
                    searchproductcategory
                },
                message: "Products fetched successfully",
            });
        } else {
            return res.status(400).send({
                success: false,
                statuscode: 400,
                message: "Product not found",
            });
        }
    } catch (error) {
        console.log("error : ", error);
        return res.status(500).send({
            success: false,
            statuscode: 500,
            message: "An error occurred",
            error: error.message,
        });
    }
};

//to get singleProduct
exports.getSingleproduct = async function (req,res) {

    try {
        let id = req.params.id;

    if(id) {
        let product = await Product.findOne({_id : id});

        if(product){

            let Category = await category.findOne({_id :product.category });

            let categoryProduct = await Product.find({category : Category._id})
            
            return res.status(200).send({
                success: true,
                statuscode: 200,
                product:product,
                productcategory:Category.name,
                categoryProduct: categoryProduct,
                message: "Products fetched successfully",
            });
        }else{
            return res.status(400).send({
                success: false,
                statuscode: 400,
                message: "Products fetched successfully",
            });
        }
    }else{
        return res.status(400).send({
            success: false,
            statuscode: 400,
            message: "Products fetched successfully",
        });
    }
    } catch (error) {
        console.log("error : ",error)
    }
}

//to add products in addtocart
exports.addToCart = async function (req, res) {
    try {
        const { id, productid } = req.params; // Extract user ID and product ID

        // Validate inputs
        if (!id) {
            return res.status(401).json({ success: false, message: 'Please log in to add to the cart.' });
        }
        if (!productid) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }

        // Use $addToSet to add product ID to the cart if it doesn't already exist
        const updateResult = await Users.updateOne(
            { _id: id },
            { $addToSet: { addtocart: productid } } // Add productid directly as a string
        );

        console.log("updateResult:", updateResult);

        // Fetch the updated user document to calculate the cart count
        const updatedUser = await Users.findOne({ _id: id });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check update result
        if (updateResult.matchedCount > 0) {
            if (updateResult.modifiedCount > 0) {
                res.json({
                    success: true,
                    message: 'Product added to cart successfully!',
                    // Return the updated cart count
                });
            } else {
                res.status(400).json({ success: false, message: 'Product is already in the cart.', count: updatedUser.addtocart.length });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: 'An error occurred while adding to the cart.', error });
    }
};

//to update from addtocart
exports.updateAddToCart = async function (req, res) {
    try {
        const { id, productid } = req.params; // Extract user ID and product ID

        // Validate inputs
        if (!id) {
            return res.status(401).json({ success: false, message: 'Please log in to manage the cart.' });
        }
        if (!productid) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }

        // Use $pull to remove the product ID from the cart
        const updateResult = await Users.updateOne(
            { _id: id },
            { $pull: { addtocart: productid } } // Remove the specific product ID from the cart array
        );

        console.log("updateResult:", updateResult);

        // Check update result
        if (updateResult.matchedCount > 0) {
            if (updateResult.modifiedCount > 0) {
                // Fetch the updated user document to calculate the new cart count
                const updatedUser = await Users.findOne({ _id: id });
                res.json({
                    success: true,
                    message: 'Product removed from cart successfully!',
                    count: updatedUser ? updatedUser.addtocart.length : 0, // Return updated cart count
                });
            } else {
                res.status(400).json({ success: false, message: 'Product not found in the cart.' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the cart.', error });
    }
};

//to add products in wishlist
exports.addToWishlist = async function (req, res) {
    try {
        const { id, productid } = req.params; // Extract user ID and product ID

        // Validate inputs
        if (!id) {
            return res.status(401).json({ success: false, message: 'Please log in to add to the wishlist.' });
        }
        if (!productid) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }

        // Use $addToSet to add product ID to the wishlist if it doesn't already exist
        const updateResult = await Users.updateOne(
            { _id: id },
            { $addToSet: { wishlist: productid } } // Add productid directly as a string
        );

        console.log("updateResult:", updateResult);

        // Check update result
        if (updateResult.matchedCount > 0) {
            if (updateResult.modifiedCount > 0) {
                // Return success and updated wishlist count
                const updatedUser = await Users.findOne({ _id: id });
                return res.json({
                    success: true,
                    message: 'Product added to wishlist successfully!',
                    wishlistCount: updatedUser.wishlist.length,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Product is already in the wishlist.',
                    wishlistCount: updateResult.matchedCount, // No new product added
                });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: 'An error occurred while adding to the wishlist.', error });
    }
};

//to update from Whishlist
exports.updateAddToWishlist = async function (req, res) {
    try {
        const { id, productid } = req.params; // Extract user ID and product ID

        // Validate inputs
        if (!id) {
            return res.status(401).json({ success: false, message: 'Please log in to manage the wishlist.' });
        }
        if (!productid) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }

        // Use $pull to remove the product ID from the wishlist
        const updateResult = await Users.updateOne(
            { _id: id },
            { $pull: { wishlist: productid } } // Remove the specific product ID from the wishlist
        );

        console.log("updateResult:", updateResult);

        // Check update result
        if (updateResult.matchedCount > 0) {
            if (updateResult.modifiedCount > 0) {
                // If the product was successfully removed, send updated wishlist count
                const updatedUser = await Users.findOne({ _id: id });
                res.json({
                    success: true,
                    message: 'Product removed from wishlist successfully!',
                    wishlistCount: updatedUser ? updatedUser.wishlist.length : 0, // Updated wishlist count
                });
            } else {
                res.status(400).json({ success: false, message: 'Product not found in the wishlist.' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the wishlist.', error });
    }
};

//to fetch all products in addtocart
exports.getAllAddToCart = async function (req, res) {
    try {
        const id = req.params.id;

        // Validate the User ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing user ID",
            });
        }

        console.log("Fetching cart for user ID:", id);

        // Fetch the user by ID
        const user = await Users.findById(id);
        console.log("User:", user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the user has items in their cart
        const { addtocart } = user;
        if (!addtocart || addtocart.length === 0) {
            const pincode = user.address?.[0]?.pincode || "N/A";
            return res.status(200).json({
                success: true,
                message: "No products in the user's cart",
                products: [],
                count: 0,
                totalprice: 0,
                address: pincode,
            });
        }

        console.log("Product IDs in cart:", addtocart);

        // Pagination (optional)
        const limit = parseInt(req.query.limit, 10) || addtocart.length;
        const skip = parseInt(req.query.skip, 10) || 0;

        // Fetch products from the database
        const products = await Product.find({ _id: { $in: addtocart } })
            .skip(skip)
            .limit(limit);

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found for the given IDs",
            });
        }

        console.log("Products:", products);

        // Calculate total items and optional metadata
        const totalCount = addtocart.length;
        const totalPrice = products.reduce((sum, product) => sum + (product.price || 0), 0);
        const pincode = user.address?.[0]?.pincode || "N/A";

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
            count: totalCount,
            totalprice: totalPrice,
            address: pincode,
        });
    } catch (error) {
        console.error("Error fetching cart products:", error.message);
        res.status(500).json({
            success: false,
            message: "An internal server error occurred",
            error: error.message,
        });
    }
};

//to fetch all products in Whishlist
exports.getAllWishlist = async function (req, res) {
    try {
        const id = req.params.id; 

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing user ID",
            });
        }

        console.log("Fetching wishlist for user ID:", id);

        const user = await Users.findById(id);
        console.log("User:", user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const { wishlist } = user;
        const pincode = user.address?.[0]?.pincode || "N/A";
        if (!wishlist || wishlist.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No products in the user's wishlist",
                products: [],
                count: 0,
            });
        }

        console.log("Product IDs in wishlist:", wishlist);

        const limit = parseInt(req.query.limit, 10) || wishlist.length;
        const skip = parseInt(req.query.skip, 10) || 0;

        const products = await Product.find({ _id: { $in: wishlist } })
            .skip(skip)
            .limit(limit);

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found for the given IDs",
            });
        }

        console.log("Products:", products);

        const totalCount = wishlist.length;

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
            count: totalCount,
            pincode :pincode
        });
    } catch (error) {
        console.error("Error fetching wishlist products:", error.message);
        res.status(500).json({
            success: false,
            message: "An internal server error occurred",
            error: error.message,
        });
    }
};

//to place order
exports.placeOrder = async function (req, res) {
    try {
        const userId = req.params.id;
        console.log("userId:", userId);

        const { items } = req.body;
        console.log("items:", items);

        // Validate inputs
        if (!items || items.length === 0 || !items.every(item => item.product_id && item.quantity > 0)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or quantity",
            });
        }

        const user = await Users.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        let totalOrderPrice = 0;
        let orderedProducts = [];
        let reorderedProducts = [];

        // Process the items for the new order
        for (let item of items) {
            const { product_id, quantity } = item;

            // Check if the product has already been ordered (prevents duplicate order)
            const alreadyOrderedProduct = user.orders.find(order => order.productId.toString() === product_id);
            if (alreadyOrderedProduct) {
                reorderedProducts.push(alreadyOrderedProduct);  // Track the reordered product
                continue;  // Skip adding already ordered products
            }

            const product = await Product.findOne({ _id: product_id });
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${product_id} not found`,
                });
            }

            if (product.stockQuantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock available for product ${product.name}`,
                });
            }

            const productTotalPrice = product.price * quantity;
            totalOrderPrice += productTotalPrice;

            // Update the user's orders with the new product
            user.orders.push({
                productId: product_id,
                quantity,
                totalPrice: productTotalPrice,
            });

            orderedProducts.push({
                productName: product.name,
                quantity,
                price: product.price,
                totalPrice: productTotalPrice,
            });

            // Decrease the stock of the product
            product.stockQuantity -= quantity;

            let adminmail = 'admin@gmail.com'

            if (product.stockQuantity === 0) {
                product.stockStatus = "Out of Stock";
                // Send email notification to the seller (uncomment if needed)
                // const emailTemplate1 = await set_stock_template(adminmail,user.email, product.stockQuantity,product.name);
                // await sendEmail(user.email, "Out of Stock Notification", emailTemplate1);
            }

            // Save the updated product data in the database
            await product.save();
        }

        // Save the user's updated order history
        await user.save();

        // If there are reordered products, return a conflict response
        if (reorderedProducts.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Some products have already been ordered",
                reorderedProducts, // Send reordered products to frontend
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            totalAmount: totalOrderPrice,
            orders: user.orders,
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

exports.reorder = async function (req, res) {
    try {
        const userId = req.params.id;
        console.log("userId:", userId);

        const { items } = req.body;
        console.log("items:", items);

        // Validate inputs
        if (!items || items.length === 0 || !items.every(item => item.product_id && item.quantity > 0)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or quantity",
            });
        }

        const user = await Users.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        let totalOrderPrice = 0;
        let reorderedProducts = [];

        // Process the items for reorder
        for (let item of items) {
            const { product_id, quantity } = item;

            // Check if the product has already been ordered before
            const alreadyOrderedProduct = user.orders.find(order => order.productId.toString() === product_id);
            if (!alreadyOrderedProduct) {
                continue;  // Skip products that haven't been ordered before
            }

            const product = await Product.findOne({ _id: product_id });
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${product_id} not found`,
                });
            }

            if (product.stockQuantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock available for product ${product.name}`,
                });
            }

            const productTotalPrice = product.price * quantity;
            totalOrderPrice += productTotalPrice;

            // Add the reordered product to the order
            user.orders.push({
                productId: product_id,
                quantity,
                totalPrice: productTotalPrice,
            });

            reorderedProducts.push({
                productName: product.name,
                quantity,
                price: product.price,
                totalPrice: productTotalPrice,
            });

            // Decrease the stock of the product
            product.stockQuantity -= quantity;

            if (product.stockQuantity === 0) {
                product.stockStatus = "Out of Stock";
                // Send email notification to the seller (uncomment if needed)
                // const emailTemplate1 = await set_stock_template(user.email, product.stockQuantity);
                // await sendEmail(user.email, "Out of Stock Notification", emailTemplate1);
            }

            // Save the updated product data in the database
            await product.save();
        }

        // Send reorder confirmation email if needed
        // const emailTemplate = await set_orderplace_template(user.email, reorderedProducts, totalOrderPrice);
        // await sendEmail(user.email, "Reorder Confirmation", emailTemplate);

        // Save the user's updated order history
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Reorder placed successfully",
            totalAmount: totalOrderPrice,
            orders: user.orders,
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

//to cancel order
exports.CancelOrder = async function (req, res) {
    try {
        const userId = req.params.id;
        const { order_id, product_id, quantity } = req.body; // order_id, product_id, and quantity to cancel the order
        console.log("userid : ", userId, "order_id : ", order_id, "product_id : ", product_id, "quantity : ", quantity);

        // Validate inputs
        if (!order_id || !product_id || !quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID, product ID, or quantity",
            });
        }

        // Find the user by ID
        const user = await Users.findOne({ _id: userId });
        console.log("user : ", user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Find the product by ID
        const product = await Product.findOne({ _id: product_id });
        console.log("product : ", product);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Find the specific order in the user's orders array using the order _id
        const order = user.orders.find(order => order._id.toString() === order_id && order.productId.toString() === product_id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check if the quantity to cancel is valid
        if (order.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel more than the ordered quantity",
            });
        }

        // Update the product stock by adding back the canceled quantity
        product.stockQuantity += quantity;

        // If stockQuantity is now greater than 0, update the stock status to "In Stock"
        if (product.stockQuantity > 0) {
            product.stockStatus = "In Stock";
        }

        // Remove the canceled order from the user's orders array
        user.orders = user.orders.filter(order => !(order._id.toString() === order_id && order.productId.toString() === product_id));

        // Save the updated user and product
        await user.save();
        await product.save();

        // Send email to the user about the order cancellation
        // const emailTemplate = await set_order_cancel_template(user.email, product.name, quantity);
        // await sendEmail(user.email, "Order Cancelled", emailTemplate);
        // console.log("Cancellation email sent to user");

        return res.status(200).json({
            success: true,
            message: "Order canceled successfully",
            orders: user.orders, 
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

exports.getOrderedProducts = async function (req, res) {
    try {
        const userId = req.params.id; // Get userId from the URL parameters
        console.log("User ID:", userId);

        // Find the user by ID
        const user = await Users.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Fetch product details using product IDs from the orders collection
        const orderedProducts = [];

        for (let order of user.orders) {
            const productId = order.productId; // this is the productId from the Orders collection

            if (productId) {
                // Fetch the product from the Product collection using the productId
                const product = await Product.findById(productId);
                if (product) {
                    orderedProducts.push({
                        orderId: order._id, // Include order ID
                        orderDate: order.orderDate, // Assuming you have an order date in the order object
                        productId: product._id,
                        productName: product.name,
                        quantity: order.quantity,
                        totalPrice: order.totalPrice,
                        productImage: product.images, // Include image if it exists
                        productDescription: product.description, // Include description if it exists
                        price: product.price, // The original price
                        discountPrice: product.discountPrice, // Assuming discountPrice exists in Product schema
                        category: product.category, // If you have a category field
                        brand: product.brand, // If you have a brand field
                    });
                } else {
                    return res.status(404).json({
                        success: false,
                        message: `Product with ID ${productId} not found`,
                    });
                }
            }
        }

        if (orderedProducts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found in order history",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ordered products fetched successfully",
            orderedProducts,
        });

    } catch (error) {
        console.error("Error fetching ordered products:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching ordered products",
        });
    }
};














































  



