const mongoose = require('mongoose')

const TestVideoSchema = mongoose.Schema({
    video : {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }
})

const TestVideo = mongoose.model('TestVideo',TestVideoSchema)
module.exports = TestVideo;