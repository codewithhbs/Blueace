const mongoose = require('mongoose');

const CaseStudySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    smallDes: {
        type: String,
        required: true
    },
    longDes: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Residential', 'Commercial', 'Landscape', 'Other'],
        default: 'Other'
    },
    clientName: {
        type: String
    },
    location: {
        type: String
    },
    completionDate: {
        type: Date
    },
    // technologiesUsed: {
    //     type: [String] // Example: ['AC Design', 'Ductwork', 'HVAC']
    // },
    smallImage: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    largeImage: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    videoUrl: {
        type: String // Optional: YouTube/Vimeo video link
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

// Add pre-save hook for updatedAt
CaseStudySchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const CaseStudy = mongoose.model('CaseStudy', CaseStudySchema);

module.exports = CaseStudy;
