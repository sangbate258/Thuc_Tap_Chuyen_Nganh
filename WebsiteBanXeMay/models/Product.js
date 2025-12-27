const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    // ✅ Liên kết tới Category (giống FK)
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    // brand: {
    //     type: String,
    //     required: true
    // },

    price: {
        type: Number,
        required: true
    },

    year: {
        type: Number,
        default: 2024
    },

    condition: {
        type: String,
        default: "Xe Cũ"
    },

    image: {
        type: String,
        required: false
    },

    description: {
        type: String,
        required: false
    },

    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);