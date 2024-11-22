'use strict';
const Category = require('../model/category'); // Import the Category model

module.exports = {
  up: (models, mongoose) => {
    // Sample data with predefined IDs as strings
    const categories = [
      {
        _id: '64b3bde93d9b9e00123abcd1',  // Skin care
        name: 'Skin care',
        subcategories: [
          {
            _id: '64b3bde93d9b9e00123abcd2',
            name: 'Lip care',
            items: [
              { _id: '64b3bde93d9b9e00123abcd3', name: 'Lip Balm' },
              { _id: '64b3bde93d9b9e00123abcd4', name: 'Lip Scrub' },
              { _id: '64b3bde93d9b9e00123abcd5', name: 'Lip Mask' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abcd6',
            name: 'Cleansers',
            items: [
              { _id: '64b3bde93d9b9e00123abcd7', name: 'Facewash' },
              { _id: '64b3bde93d9b9e00123abcd8', name: 'Cleanser' },
              { _id: '64b3bde93d9b9e00123abcd9', name: 'Scrubs & Exfoliators' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abcda',
            name: 'Toners & Facemist',
            items: [
              { _id: '64b3bde93d9b9e00123abcdb', name: 'Toners' },
              { _id: '64b3bde93d9b9e00123abcdc', name: 'Facemists' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abcdd',
            name: 'Facial kits & Bleaches',
            items: [
              { _id: '64b3bde93d9b9e00123abcde', name: 'Facial kits' },
              { _id: '64b3bde93d9b9e00123abcdf', name: 'Bleaches' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abce0',
            name: 'Eye care',
            items: [
              { _id: '64b3bde93d9b9e00123abce1', name: 'Eye Mask' },
              { _id: '64b3bde93d9b9e00123abce2', name: 'Eye Serum' }
            ]
          }
        ]
      },
      {
        _id: '64b3bde93d9b9e00123abce3', // Hair care
        name: 'Hair care',
        subcategories: [
          {
            _id: '64b3bde93d9b9e00123abce4',
            name: 'Hair Styling',
            items: [
              { _id: '64b3bde93d9b9e00123abce5', name: 'Hair colour' },
              { _id: '64b3bde93d9b9e00123abce6', name: 'Hair Spray' },
              { _id: '64b3bde93d9b9e00123abce7', name: 'Hair Fibre' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abce8',
            name: 'Shampoo & Conditioners',
            items: [
              { _id: '64b3bde93d9b9e00123abce9', name: 'Shampoo' },
              { _id: '64b3bde93d9b9e00123abcea', name: 'Conditioners' },
              { _id: '64b3bde93d9b9e00123abceb', name: 'Dry Shampoo' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abcec',
            name: 'Hair Accessories',
            items: [
              { _id: '64b3bde93d9b9e00123abced', name: 'Hair Clips' },
              { _id: '64b3bde93d9b9e00123abcee', name: 'Hair Extensions' }
            ]
          }
        ]
      },
      {
        _id: '64b3bde93d9b9e00123abcf0', // Bath and Body
        name: 'Bath and Body',
        subcategories: [
          {
            _id: '64b3bde93d9b9e00123abcf1',
            name: 'Body Care',
            items: [
              { _id: '64b3bde93d9b9e00123abcf2', name: 'Body Serum' },
              { _id: '64b3bde93d9b9e00123abcf3', name: 'Talc' },
              { _id: '64b3bde93d9b9e00123abcf4', name: 'Body Cream' },
              { _id: '64b3bde93d9b9e00123abcf5', name: 'Body Masks' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abcf6',
            name: 'Bath & Shower',
            items: [
              { _id: '64b3bde93d9b9e00123abcf7', name: 'Soap' },
              { _id: '64b3bde93d9b9e00123abcf8', name: 'Body Scrub' },
              { _id: '64b3bde93d9b9e00123abcf9', name: 'Body Wipes' }
            ]
          }
        ]
      },
      {
        _id: '64b3bde93d9b9e00123abd00', // Accessories
        name: 'Accessories',
        subcategories: [
          {
            _id: '64b3bde93d9b9e00123abd01',
            name: 'Jewellery',
            items: [
              { _id: '64b3bde93d9b9e00123abd02', name: 'Hair jewellery' },
              { _id: '64b3bde93d9b9e00123abd03', name: 'Complete Jewellery Collection' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abd04',
            name: 'Makeup Accessories',
            items: [
              { _id: '64b3bde93d9b9e00123abd05', name: 'Makeup Pouches' },
              { _id: '64b3bde93d9b9e00123abd06', name: 'Nail Art' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abd07',
            name: 'Skin Accessories',
            items: [
              { _id: '64b3bde93d9b9e00123abd08', name: 'Cleansing Tools' },
              { _id: '64b3bde93d9b9e00123abd09', name: 'Bathing Accessories' }
            ]
          }
        ]
      },
      {
        _id: '64b3bde93d9b9e00123abd10', // Makeup
        name: 'Makeup',
        subcategories: [
          {
            _id: '64b3bde93d9b9e00123abd11',
            name: 'Nails',
            items: [
              { _id: '64b3bde93d9b9e00123abd12', name: 'Nail Polish' },
              { _id: '64b3bde93d9b9e00123abd13', name: 'Nail Polish Remover' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abd14',
            name: 'Face Makeup',
            items: [
              { _id: '64b3bde93d9b9e00123abd15', name: 'Foundation' },
              { _id: '64b3bde93d9b9e00123abd16', name: 'Compact' },
              { _id: '64b3bde93d9b9e00123abd17', name: 'Blush' }
            ]
          }
        ]
      },
      {
        _id: '64b3bde93d9b9e00123abd18', // Personal Care
        name: 'Personal Care',
        subcategories: [
          {
            _id: '64b3bde93d9b9e00123abd19',
            name: 'Personal Hygiene',
            items: [
              { _id: '64b3bde93d9b9e00123abd1a', name: 'Toothpaste' },
              { _id: '64b3bde93d9b9e00123abd1b', name: 'Deodorant' }
            ]
          },
          {
            _id: '64b3bde93d9b9e00123abd1c',
            name: 'Shaving & Hair Removal',
            items: [
              { _id: '64b3bde93d9b9e00123abd1d', name: 'Razor' },
              { _id: '64b3bde93d9b9e00123abd1e', name: 'Hair Removal Cream' }
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
            _id: {
              $in: [
                '64b3bde93d9b9e00123abcd1',
                '64b3bde93d9b9e00123abce3',
                '64b3bde93d9b9e00123abcf0',
                '64b3bde93d9b9e00123abd00',
                '64b3bde93d9b9e00123abd10',
                '64b3bde93d9b9e00123abd18'
              ]
            }
          }
        }
      }
    ]).then(res => {
      console.log(`Deleted ${res.deletedCount} categories`);
    }).catch(err => {
      console.error('Error during deletion:', err);
    });
  }
};

