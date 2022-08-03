const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Review Schema

const ReviewSchema = new Schema({
    body: {
        type: String,
        required: true
    },
    rating: Number
}, { timestamps: true })

module.exports = mongoose.model('Review', ReviewSchema);