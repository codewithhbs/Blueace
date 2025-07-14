const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const rangeSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            // required: true
        }
    }
})

const UserSchema = new mongoose.Schema({
    FullName: {
        type: String,
        required: [true, "Please provide a Full Name"]
    },
    ContactNumber: {
        type: String,
        unique: true,
        required: [true, "Please provide a Contact Number"]
    },
    Email: {
        type: String,
        required: [true, "Please provide an Email"],
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    Password: {
        type: String,
        required: [true, "Please provide a Password"]
    },
    PasswordChangeOtp: {
        type: String
    },
    OtpExpiredTime: {
        type: Date
    },
    NewPassword: {
        type: String
    },
    Role: {
        type: String,
        enum: ['Customer', 'Admin'],
        default: 'Customer'
    },
    UserType: {
        type: String,
        enum: ['Normal', 'Corporate'],
        default: 'Normal'
    },
    PinCode: {
        type: String,
        default: "000000",
        match: [/^\d{6}$/, 'Please enter a valid PinCode with 6 digits']
    },
    HouseNo: {
        type: String,
        default: "H. No.",
        // required: true
    },
    NearByLandMark: {
        type: String,
        default: "Landmark",
    },
    RangeWhereYouWantService: [
        rangeSchema
    ],
    userImage: {
        url: {
            type: String,
        },
        public_id: {
            type: String,
        }
    },
    isDeactive: {
        type: Boolean,
        default: false
    },
    companyName: {
        type: String
    },
    address: {
        type: String
    },
    isAMCUser: {
        type: Boolean,
        default: false
    },
    loginOtp: {
        type: String
    },
    loginOtpExpiredTime: {
        type: Date
    },
    isVerify: {
        type: Boolean,
        default: false
    },
    isSoftDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('Password')) {
        return next();
    }
    try {
        const hashedPassword = await bcrypt.hash(user.Password, 10);
        user.Password = hashedPassword;
        return next();
    } catch (error) {
        return next(error);
    }
});

UserSchema.index({ 'RangeWhereYouWantService.location': '2dsphere' });

// Method to compare passwords
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.Password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;