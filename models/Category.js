const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Category schema

const CategorySchema = new Schema({
    title: String,
    slug: {
        type: String,
        lowercase: true,
    }
})

module.exports = mongoose.model('Category', CategorySchema);