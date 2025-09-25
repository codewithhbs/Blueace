const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    title: {
        type: String
    },
    smalldesc: {
        type: String
    },
    longdesc: {
        type: String
    },
    smallImage: {
        url:{
            type: String
        },
        public_id:{
            type: String
        }
    },
    largeImage: {
        url:{
            type: String
        },
        public_id:{
            type: String
        }
    },
    price: {
        type: Number
    },
    metaTitle: {
        type: String
    },
    metaDescription: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;