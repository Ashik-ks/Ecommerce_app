const success_function = require('../utils/responsehandler').success_function;
const error_function = require('../utils/responsehandler').error_function;
const users = require('../db/model/users');
const UserType = require('../db/model/userType')
const Admin  = require('../db/model/admin'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const set_otp_template =require("../utils/email-templates/set-password").resetPassword;
const sendEmail = require("../utils/send-email").sendEmail;
const dotenv = require('dotenv');
dotenv.config();


exports.sendotp = async function (req, res) {
    try {
        const { email, userType, password } = req.body;

        console.log("Request body received:", req.body);

        if (!email || !userType) {
            console.error("Missing email or userType");
            return res.status(400).send({
                message: "Email and userType are required",
            });
        }

        // Admin login validation
        const adminEmail = "admin@gmail.com";
        if (email === adminEmail) {
            console.log("Admin login attempt detected");

            if (!password) {
                console.error("Missing password for admin login");
                return res.status(400).send({
                    message: "Password is required for admin login.",
                });
            }

            const admin = await Admin.findOne({ email: adminEmail });
            if (!admin) {
                console.error("Admin not found in database");
                return res.status(400).send({
                    message: "Admin not found. Please contact support.",
                });
            }

            const isPasswordValid = await bcrypt.compare(password, admin.password);
            if (!isPasswordValid) {
                console.error("Incorrect password for admin login");
                return res.status(400).send({
                    message: "Invalid password. Please try again.",
                });
            }

            const token = jwt.sign(
                { user_id: admin._id },
                process.env.PRIVATE_KEY,
                { expiresIn: "10d" }
            );

            console.log("Admin login successful");
            return res.status(200).send({
                statusCode: 200,
                message: "Admin logged in successfully.",
                data: {
                    email: admin.email,
                    token: token,
                    userType: "Admin",
                    id:admin._id,
                },
            });
        }

        console.log("Non-admin user flow for email:", email);

        const userTypeDocument = await UserType.findOne({ userType });
        if (!userTypeDocument) {
            console.error(`User type '${userType}' not found`);
            return res.status(400).send({
                message: `User type '${userType}' not found`,
            });
        }

        console.log("User type document found:", userTypeDocument);

        let user = await users.findOne({ email });
        const otp = crypto.randomInt(100000, 999999);

        if (user) {
            console.log("Existing user found:", user);

            if (user.userType.toString() !== userTypeDocument._id.toString()) {
                console.error("User type mismatch");
                return res.status(400).send({
                    message: "User type mismatch. Please select the correct user type.",
                });
            }

            user.otp = otp;
            await user.save();
            console.log("Updated OTP for existing user:", otp);

            return res.status(200).send({
                statusCode: 200,
                data: { email },
                message: "User exists. OTP updated in database.",
            });
        } else {
            console.log("No existing user found, creating a new user");

            const name = userType === "Buyer" ? "Guest" : undefined;

            const body = {
                email,
                userType: userTypeDocument._id,
                name,
                otp,
            };

            user = await users.create(body);
            console.log("New user created:", user);

            try {
                const emailTemplate = await set_otp_template(email, otp);
                await sendEmail(email, "User created", emailTemplate);
                console.log("OTP email sent successfully to new user:", email);

                return res.status(200).send({
                    statusCode: 200,
                    data: { email },
                    message: "New user created. OTP sent to your email. Please check your inbox.",
                });
            } catch (emailError) {
                console.error("Failed to send OTP email:", emailError);

                // Consider rolling back user creation or notifying admin
                return res.status(500).send({
                    statusCode: 500,
                    message: "New user created, but failed to send OTP email. Please try again later.",
                });
            }
        }
    } catch (error) {
        console.error("Error in sendotp function:", error);
        return res.status(400).send({
            statusCode: 400,
            message: error.message || "Something went wrong",
        });
    }
};


exports.verifyotp = async function (req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).send({
                message: "Email and OTP are required",
            });
        }

        // Find the user by email
        let user = await users.findOne({ email });
        if (!user) {
            return res.status(400).send({
                message: "User not found. Please register first.",
            });
        }

        console.log("Received OTP:", otp);
        console.log("Stored OTP:", user.otp);

        // Check if the OTP matches
        if (otp !== user.otp) {
            // If OTP doesn't match, delete the user and send a failure response
            await users.deleteOne({ email });
            return res.status(400).send({
                message: "Invalid OTP. Please try again.",
            });
        }

        // OTP is correct, log the user in or complete the registration
        user.otp = undefined; // Optionally, delete the OTP for security
        await user.save();

        let type;
        if (user.userType) {
            type = await UserType.findOne({ _id: user.userType });
        } else {
            return res.status(400).send({
                message: "User type is missing. Please try again.",
            });
        }

        console.log("User type:", type.userType);

        // Generate a JWT token
        const token = jwt.sign({ user_id: user._id }, process.env.PRIVATE_KEY, { expiresIn: "10d" });
        console.log("Generated Token:", token);

        const data = { 
            user,               
            token,
            tokenid: user._id,
            userType: type.userType,
        };

        // Redirect users based on their type
        if (type.userType === 'Admin') {
            return res.status(200).send({
                statusCode: 200,
                message: "Admin logged in successfully.",
                data: data,
            });
        }

        // For non-admin users, proceed as normal (Buyer or Seller)
        return res.status(200).send({
            statusCode: 200,
            message: "User logged in or registered successfully.",
            data: data,
        });

    } catch (error) {
        console.error("Error: ", error);
        return res.status(400).send({
            statusCode: 400,
            message: error.message || "Something went wrong",
        });
    }
};







