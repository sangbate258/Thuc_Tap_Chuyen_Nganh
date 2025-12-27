const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    status: {
        type: Boolean,
        default: true
    }
}, );

module.exports = mongoose.model('Category', CategorySchema);