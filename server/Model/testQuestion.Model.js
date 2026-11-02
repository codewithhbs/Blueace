const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    }
});

const TestQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [optionSchema],
        validate: [arrayLimit, 'A question must have at least 2 options']
    }
}, { timestamps: true });

// Custom validator to ensure minimum 2 options
function arrayLimit(val) {
    return val.length >= 2;
}

const TestQuestion = mongoose.model('TestQuestion', TestQuestionSchema);
module.exports = TestQuestion;
