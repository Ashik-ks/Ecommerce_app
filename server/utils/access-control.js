const Users = require("../db/model/users");
const Admin = require("../db/model/admin");
const success_function = require("./responsehandler").success_function;
const error_function = require("./responsehandler").error_function;
const jwt = require('jsonwebtoken');
const control_data = require('./control-data.json');
const dotenv = require('dotenv');
dotenv.config();

exports.accessControl = async function (access_types, req, res, next) {
    try {
        console.log("access_types: ", access_types);

        // If access is unrestricted, proceed to next middleware
        if (access_types === '*') {
            return next();
        }

        const authHeader = req.headers["authorization"];
        console.log("authHeader: ", authHeader);

        // Check for authorization header
        if (!authHeader) {
            return res.status(400).send(error_function({
                statusCode: 400,
                message: "Please login to continue",
            }));
        }

        // Extract token from authorization header
        const token = authHeader.split(' ')[1];
        console.log("token: ", token);

        // Validate token
        if (!token) {
            return res.status(400).send(error_function({
                statusCode: 400,
                message: "Please login to continue",
            }));
        }

        // Verify the token
        jwt.verify(token, process.env.PRIVATE_KEY, async (err, decoded) => {
            if (err) {
                return res.status(400).send(error_function({
                    statusCode: 400,
                    message: "Please login to continue",
                }));
            }

            console.log("decoded: ", decoded);

            const userId = decoded.user_id;
            console.log("user_id: ", userId);

            // Fetch the user or admin from the database
            let user;
            let isUserAdmin = false;

            user = await Users.findById(userId).populate("userType");
            if (!user) {
                user = await Admin.findById(userId);
                if (user) {
                    isUserAdmin = true;
                }
            }

            if (!user) {
                return res.status(404).send(error_function({
                    statusCode: 404,
                    message: "User not found",
                }));
            }

            console.log("user: ", user);

            // Check for admin or allowed user type
            if (isUserAdmin) {
                return next();
            }

            const userType = user.userType.userType;
            console.log("user_type: ", userType);

            // Determine allowed user types
            const allowed = access_types.split(",").map(type => control_data[type]);
            console.log("allowed: ", allowed);

            // Check if user type is allowed access
            if (allowed && allowed.includes(userType)) {
                return next();
            } else {
                return res.status(403).send(error_function({
                    statusCode: 403,
                    message: "Not allowed to access this route",
                }));
            }
        });
    } catch (error) {
        console.error("Error in accessControl: ", error);
        return res.status(500).send(error_function({
            statusCode: 500,
            message: "Internal server error",
        }));
    }
};

