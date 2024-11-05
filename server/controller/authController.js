const success_function = require('../utils/responsehandler').success_function;
const error_function = require('../utils/responsehandler').error_function;
const users = require('../db/model/users');
const admins = require('../db/model/admin');
const UserType = require('../db/model/userType')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


//Singup for seller and buyer
exports.signup = async function (req, res) {
    try {
        const body = req.body;
        console.log("Received request body: ", body);

        const emailRegex = /^\S+@\S+\.\S+$/;
        const phoneRegex = /^\d{10}$/; // Validate for exactly 10 digits
        const pincodeRegex = /^\d{6}$/; // Validate for exactly 6 digits

        // Validate input
        if (!body.fullname || !body.email || !body.password || !body.phonenumber || !body.address || !body.userType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Validate email format
        if (!emailRegex.test(body.email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format."
            });
        }

        // Validate phone number
        if (!phoneRegex.test(body.phonenumber)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must contain exactly 10 digits."
            });
        }

        // Validate pincode
        if (!pincodeRegex.test(body.address.pincode)) {
            return res.status(400).json({
                success: false,
                message: "Pincode must contain exactly 6 digits."
            });
        }

        // Check for existing user
        const existingUserCount = await users.countDocuments({ email: body.email });
        if (existingUserCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already in use."
            });
        }

        // Find user type and set userType ID
        const userTypeCollection = await UserType.findOne({ userType: body.userType });
        if (!userTypeCollection) {
            return res.status(400).json({
                success: false,
                message: "Invalid user type."
            });
        }

        body.userType = userTypeCollection._id; // Set userType ID

        // Hash the password
        body.password = await bcrypt.hash(body.password, 10);

        // Create the user
        const newUser = await users.create(body);

        // Construct success response
        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: newUser
        });

    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


//Login for users and admin
exports.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        console.log("Request body: ", req.body);

        // Validate input
        if (!email || !password) {
            const message = !email ? "Email is required" : "Password is required";
            return res.status(400).send(error_function({
                success: false,
                statuscode: 400,
                message,
            }));
        }

        // Attempt to find the user in both collections
        let user = await users.findOne({ email }).populate("userType") || await admins.findOne({ email }).populate("userType");
        console.log("usertype : ",user.userType.userType)

        if (!user) {
            return res.status(404).send(error_function({
                statuscode: 404,
                message: "User not found ,please enter proper email and password",
            }));
        }

        // Check if the user has a password reset token
        // if (user.password_token) {
        //     return res.status(400).send(error_function({
        //         statuscode: 400,
        //         message: "Please reset your password using the link sent to your email.",
        //     }));
        // }

        // Verify the password
        const passwordMatch = bcrypt.compareSync(password, user.password);
        console.log("Password match: ", passwordMatch);
        if (!passwordMatch) {
            return res.status(400).send(error_function({
                statuscode: 400,
                message: "Invalid password",
            }));
        }

        // Generate a JWT token
        const token = jwt.sign({ user_id: user._id }, process.env.PRIVATE_KEY, { expiresIn: "10d" });

        const responseData = {
            token,
            userTypes: user.userType,
            tokenId: user._id,
        };

        return res.status(200).send(success_function({
            statuscode: 200,
            data: responseData,
            message: "Login successful",
        }));

    } catch (error) {
        console.error("Error: ", error);
        return res.status(400).send(error_function({
            statuscode: 400,
            message: error.message || "Something went wrong",
        }));
    }
};

