const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const itemSchema = new mongoose.Schema({
  name: String
});

const subcategorySchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const categorySchema = new mongoose.Schema({
  name: String,
  subcategories: [subcategorySchema]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
