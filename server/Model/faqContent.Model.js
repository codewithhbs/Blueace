const mongoose = require('mongoose')

const faqContentSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
},{timestamps:true})

const FaqContent = mongoose.model('FaqContent',faqContentSchema)
module.exports = FaqContent