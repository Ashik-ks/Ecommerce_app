'use strict';
const bcrypt = require('bcrypt');
const admin = require('../model/admin'); // Import the access control model
const userType = require('../model/userType'); // Import the usertype model
const mongoose = require('mongoose'); // Ensure mongoose is required

module.exports = {
  up: async (models, mongoose) => {
    try {
      // Hash the password before seeding
      const hashedPassword = await bcrypt.hash('admin#123', 10);
      
      // First, insert the usertype for admin
      const userTypeRes = await userType.insertMany([
        {
          _id: new mongoose.Types.ObjectId("6724839a873af4e595676d62"), // Create ObjectId for usertype
          userType: 'Admin', // Define the usertype
        }
      ]);

      // Now, insert the admin user with a reference to the usertype
      const res = await admin.insertMany([
        {
          _id: new mongoose.Types.ObjectId("67248385873af4e595676d61"), // Use 'new' with ObjectId
          name: 'Admin',
          email: 'admin@gmail.com',
          password: hashedPassword, // Store hashed password
          userType: userTypeRes[0]._id // Reference the usertype _id
        }
      ]);

      console.log(`${res.length} user(s) and ${userTypeRes.length} usertype(s) seeded successfully.`);
    } catch (error) {
      console.error('Error seeding users and usertypes:', error);
    }
  },

  down: async (models, mongoose) => {
    try {
      // First, delete the admin user by ID
      const res = await admin.deleteMany({
        _id: new mongoose.Types.ObjectId("67248385873af4e595676d61"), // Use 'new' with ObjectId
      });

      // Then, delete the associated usertype
      const userTypeRes = await userType.deleteMany({
        _id: new mongoose.Types.ObjectId("6724839a873af4e595676d62"), // Use 'new' with ObjectId for usertype
      });

      console.log(`${res.deletedCount} user(s) and ${userTypeRes.deletedCount} usertype(s) deleted successfully.`);
    } catch (error) {
      console.error('Error deleting seeded users and usertypes:', error);
    }
  }
};
