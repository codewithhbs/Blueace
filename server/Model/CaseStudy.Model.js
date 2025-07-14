const mongoose = require('mongoose')

const CaseStudySchema = new mongoose.Schema({
    smallDes: {
        type: String,
        required: true
    },
    longDes: {
        type: String,
        required: true
    },
    smallImage: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            
        }
    }
})

const CaseStudy = mongoose.model('CaseStudy',CaseStudySchema)

module.exports = CaseStudy;