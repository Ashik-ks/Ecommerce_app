'use strict';
const Category = require('../model/category'); // Import the Category model

module.exports = {
  up: (models, mongoose) => {
    // Sample data for the seeder
    const categories = [
      {
        name: 'Skin care',
        subcategories: [
          {
            name: 'Lip care',
            items: [
              { name: 'Lip Balm' },
              { name: 'Lip Scrub' },
              { name: 'Lip Mask' }
            ]
          },
          {
            name: 'Cleansers',
            items: [
              { name: 'Facewash' },
              { name: 'Cleanser' },
              { name: 'Scrubs & Exfoliators' }
            ]
          },
          {
            name: 'Toners & Facemist',
            items: [
              { name: 'Toners' },
              { name: 'Facemists' }
            ]
          },
          {
            name: 'Facial kits & Bleaches',
            items: [
              { name: 'Facial kits' },
              { name: 'Bleaches' }
            ]
          },
          {
            name: 'Eye care',
            items: [
              { name: 'Eye Mask' },
              { name: 'Eye Serum' }
            ]
          }
        ]
      },
      {
        name: 'Hair care',
        subcategories: [
          {
            name: 'Hair Styling',
            items: [
              { name: 'Hair colour' },
              { name: 'Hair Spray' },
              { name: 'Hair Fibre' }
            ]
          },
          {
            name: 'Shampoo & Conditioners',
            items: [
              { name: 'Shampoo' },
              { name: 'Conditioners' },
              { name: 'Dry Shampoo' }
            ]
          },
          {
            name: 'Hair Accessories',
            items: [
              { name: 'Hair Clips' },
              { name: 'Hair Extensions' }
            ]
          }
        ]
      },
      {
        name: 'Bath and Body',
        subcategories: [
          {
            name: 'Body Care',
            items: [
              { name: 'Body Serum' },
              { name: 'Talc' },
              { name: 'Body Cream' },
              { name: 'Body Masks' }
            ]
          },
          {
            name: 'Bath & Shower',
            items: [
              { name: 'Soap' },
              { name: 'Body Scrub' },
              { name: 'Body Wipes' }
            ]
          }
        ]
      },
      {
        name: 'Makeup',
        subcategories: [
          {
            name: 'Nails',
            items: [
              { name: 'Nail Polish' },
              { name: 'Nail Polish Remover' },
              { name: 'Artificial Nails' }
            ]
          },
          {
            name: 'Face Makeup',
            items: [
              { name: 'Foundation' },
              { name: 'Compact' },
              { name: 'Blush' },
              { name: 'Makeup Removers' }
            ]
          }
        ]
      },
      {
        name: 'Personal Care',
        subcategories: [
          {
            name: 'Oral Care',
            items: [
              { name: 'ToothPaste' },
              { name: 'Tooth Brush' },
              { name: 'Mouth Wash' },
              { name: 'Tongue Cleaners' }
            ]
          },
          {
            name: 'Hand & Footcare',
            items: [
              { name: 'Footcare' },
              { name: 'Hand wash & Soaps' },
              { name: 'Hand cream & Masks' }
            ]
          }
        ]
      },
      {
        name: 'Accessories',
        subcategories: [
          {
            name: 'Jewellery',
            items: [
              { name: 'Hair jewellery' },
              { name: 'Complete Jewellery Collection' }
            ]
          },
          {
            name: 'Makeup Accessories',
            items: [
              { name: 'Makeup Pouches' },
              { name: 'Nail Art' }
            ]
          },
          {
            name: 'Skin Accessories',
            items: [
              { name: 'Cleansing Tools' },
              { name: 'Bathing Accessories' }
            ]
          }
        ]
      }
    ];

    // Insert the sample data into the Category collection
    return models.Category.bulkWrite(
      categories.map(category => ({
        insertOne: {
          document: category
        }
      }))
    ).then(res => {
      // Log the number of documents inserted
      console.log(`Inserted ${res.insertedCount} categories`);
    }).catch(err => {
      console.error('Error during insertion:', err);
    });
  },

  down: (models, mongoose) => {
    // Remove the categories that were inserted during the 'up' migration
    return models.Category.bulkWrite([
      {
        deleteMany: {
          filter: {
            name: { $in: ['Skin care', 'Hair care', 'Bath & Body', 'Makeup', 'Personal Care', 'Accessories'] } // Match categories by name
          }
        }
      }
    ]).then(res => {
      // Log the number of documents deleted
      console.log(`Deleted ${res.deletedCount} categories`);
    }).catch(err => {
      console.error('Error during deletion:', err);
    });
  }
};
