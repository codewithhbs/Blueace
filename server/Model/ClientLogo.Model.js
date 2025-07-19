const mongoose = require('mongoose')

const ClientLogoSchema = new mongoose.Schema({
    logo: {
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

const ClientLogo = mongoose.model('Client',ClientLogoSchema)
module.exports = ClientLogo