const mongoose = require('mongoose');
const Review = require('./Review');
const Schema = mongoose.Schema;

// Product schema

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        lowercase: true,
    },
    brand: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    ingredients: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, { timestamps: true });


module.exports = mongoose.model('Product', ProductSchema);