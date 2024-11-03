'use strict';
const userType = require('../model/userType');

module.exports = {
  up: (models, mongoose) => {
    
      return models.userType.insertMany([

        {
          _id : "67248367873af4e595676d5f",
          userType : "Seller"
        },
        {
          _id : "67248378873af4e595676d60",
          userType : "Buyer"
        }
        
      ]).then(res => {
      // Prints "1"
      console.log("seeding successfull");
      console.log(res.insertedCount);
    });
    
  },

  down: (models, mongoose) => {
    
      return models.userType.deleteMany({
        _id : {
          $in : [
            "67248367873af4e595676d5f",
            "67248378873af4e595676d60"
          ]
        }
      }).then(res => {
      // Prints "1"
      console.log("seeder rollback successfull");
      console.log(res.deletedCount);
      });
    
  }
};
