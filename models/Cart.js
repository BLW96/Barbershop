const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    qt: {
        type: Number,
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    image: {
        type: String,
    },
    username: {
        type: String,
        trim: true
    },
}, { timestamps: true });


module.exports = mongoose.model('Cart', cartSchema);