const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    memberAdharImage: {
        url: {
            type: String,
        },
        public_id: {
            type: String,
        }
    },
    memberQualification: {
        type: String
    },
    memberQualificationImage: {
        url: {
            type: String
        },
        public_id: {
            type: String
        },
    }
})

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

const VendorSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    yearOfRegistration: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: [true, "Please provide an Email"],
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    ownerName: {
        type: String,
        required: true
    },
    ContactNumber: {
        type: String,
        unique: true,
        required: [true, "Please provide a Contact Number"]
    },
    panNo: {
        type: String,
        required: true
    },
    gstNo: {
        type: String
    },
    adharNo: {
        type: String,
        required: true
    },
    panImage: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    adharImage: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    gstImage: {
        url: {
            type: String,
            // required: true
        },
        public_id: {
            type: String,
            // required: true
        }
    },
    member: [memberSchema],
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
        default: 'vendor',
        enum: ['vendor', 'employ'],
    },
    RangeWhereYouWantService: [
        rangeSchema
    ],
    vendorImage: {
        url: {
            type: String,
            // required: true
        },
        public_id: {
            type: String,
            // required: true
        }
    },
    isDeactive: {
        type: Boolean,
        default: false
    },
    memberShipPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipPlan'
    },
    isMember: {
        type: Boolean,
        default: false
    },
    razorpayOrderId: {
        type: String
    },
    transactionId: {
        type: String
    },
    PaymentStatus:{
        type:String,
        default:'pending' 
    },
    memberShipPrice: {
        type: Number
    },
    paymentMethod:{
        type:String
    },
    readyToWork: {
        type: Boolean,
        default: true
    },
    workingHour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkingHours',
    },
    averageRating: {
        type: Number
    },
    VerifyOTP: {
        type: Number
    },
    verifyed: {
        type: Boolean,
        default: false
    },
    HouseNo: {
        type: String
    },
    PinCode: {
        type: Number
    },
    walletAmount: {
        type: Number,
        default: 0
    },
    bankDetail: {
        accountHolderName: {
            type: String,
        },
        bankName: {
            type: String,
        },
        accountNumber: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^\d{9,18}$/.test(v); // Ensures the account number is numeric and 9–18 digits long
                },
                message: props => `${props.value} is not a valid account number!`,
            },
        },
        ifscCode: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v); // Standard IFSC code format
                },
                message: props => `${props.value} is not a valid IFSC code!`,
            },
        },
        branchName: {
            type: String,
        }
    },
    createdFrom: {
        type: String,
        enum: ['Admin','Website']
    }
}, { timestamps: true })

VendorSchema.pre('save', async function (next) {
    const vendor = this;
    if (!vendor.isModified('Password')) {
        return next();
    }
    try {
        const hashedPassword = await bcrypt.hash(vendor.Password, 10);
        vendor.Password = hashedPassword;
        return next();
    } catch (error) {
        return next(error);
    }
});

VendorSchema.index({ 'RangeWhereYouWantService.location': '2dsphere' });

VendorSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.Password);
};


const Vendor = mongoose.model('Vendor', VendorSchema)
module.exports = Vendor