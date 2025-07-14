const User = require('../Model/UserModel');
const SendToken = require('../Utils/SendToken');
const SendEmail = require('../Utils/SendEmail');
const Vendor = require('../Model/vendor.Model');
const { deleteImageFromCloudinary, uploadImage } = require('../Utils/Cloudnary');
const fs = require("fs")
const mongoose = require('mongoose');
const { sendSMS } = require('../Utils/SMSSender');
const xlsx = require('xlsx');
const sendEmail = require('../Utils/SendEmail');
const { SendWhatsapp, SendOtpWhatsapp } = require('../Utils/SendWhatsapp');
exports.register = async (req, res) => {
    try {
        const {
            companyName,
            address,
            FullName,
            Email,
            ContactNumber,
            Password,
            PinCode,
            HouseNo,
            NearByLandMark,
            RangeWhereYouWantService,
            UserType
        } = req.body;

        // Required field check
        const missingFields = [];
        if (!FullName) missingFields.push('FullName');
        if (!Email) missingFields.push('Email');
        if (!ContactNumber) missingFields.push('ContactNumber');
        if (!Password) missingFields.push('Password');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        if (Password.length <= 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be longer than 6 characters'
            });
        }

        // Normalize email and contact
        const normalizedEmail = Email.trim().toLowerCase();
        const normalizedContact = ContactNumber.trim();

        // Check if user or vendor already exists
        const [existingUser, existingVendor] = await Promise.all([
            User.findOne({
                $or: [
                    { Email: normalizedEmail },
                    { ContactNumber: normalizedContact }
                ]
            }),
            Vendor.findOne({
                $or: [
                    { Email: normalizedEmail },
                    { ContactNumber: normalizedContact }
                ]
            })
        ]);

        // Handle existing user
        if (existingUser) {
            if (!existingUser.isVerify) {
                // Resend OTP
                const OTP = Math.floor(100000 + Math.random() * 900000);
                const OTPExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

                existingUser.loginOtp = OTP;
                existingUser.loginOtpExpiredTime = OTPExpires;
                await existingUser.save();

                await SendOtpWhatsapp(existingUser.ContactNumber, OTP);

                return res.status(200).json({
                    success: true,
                    message: 'You are already registered but not verified. A new OTP has been sent to your WhatsApp.',
                    data: existingUser
                });
            }

            return res.status(400).json({
                success: false,
                message: 'User already registered and verified. Please log in instead.'
            });
        }

        // Handle existing vendor
        if (existingVendor) {
            return res.status(400).json({
                success: false,
                message: 'This email or contact number is already registered as a vendor.'
            });
        }

        // Create new OTP
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const OTPExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

        const newUser = new User({
            FullName,
            Email: normalizedEmail,
            ContactNumber: normalizedContact,
            Password,
            PinCode,
            HouseNo,
            address,
            NearByLandMark,
            RangeWhereYouWantService,
            UserType,
            companyName,
            loginOtp: OTP,
            loginOtpExpiredTime: OTPExpires
        });

        await newUser.save();
        await SendOtpWhatsapp(newUser.ContactNumber, OTP);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. OTP has been sent to your WhatsApp for verification.',
            data: newUser
        });

    } catch (error) {
        console.error('Error in register:', error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `The ${field} is already in use.`
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Something went wrong during registration. Please try again later.'
        });
    }
};

exports.verifyOtpForRegister = async (req, res) => {
    try {
        const { id } = req.params;
        const { loginOtp } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        if (user.loginOtp !== loginOtp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            })
        }

        if (user.loginOtpExpiredTime < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            })
        }

        user.loginOtp = null;
        user.loginOtpExpiredTime = null;
        user.isVerify = true;
        await user.save();

        await SendToken(user, res, 200);

    } catch (error) {
        console.log("Internal server error in verifyOtpForRegister");
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error in verifyOtpForRegister',
            error: error.message
        })
    }
}

exports.resendVerifyUserOtp = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const OTPExpires = new Date();
        OTPExpires.setMinutes(OTPExpires.getMinutes() + 10);
        user.loginOtp = OTP;
        user.loginOtpExpiredTime = OTPExpires;
        await user.save();
        await SendOtpWhatsapp(user?.ContactNumber, OTP);
        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: user
        })
    } catch (error) {
        console.log("Internal server error in sending otp for verifing vendor", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.login = async (req, res) => {
    const { Email, Password, ContactNumber } = req.body;
    console.log("Login attempt with body:", req.body);

    try {
        const normalizedEmail = Email?.trim().toLowerCase();
        const normalizedContact = ContactNumber?.trim();

        let user = await User.findOne({
            $or: [
                { Email: normalizedEmail },
                { ContactNumber: normalizedContact }
            ]
        });

        let model = 'User';

        // If not found in User, try Vendor
        if (!user) {
            user = await Vendor.findOne({
                $or: [
                    { Email: normalizedEmail },
                    { ContactNumber: normalizedContact }
                ]
            });
            model = user ? 'Vendor' : '';
        }

        // Not found in either
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found. Please register first.'
            });
        }

        // Handle soft deleted account
        if (user.isSoftDeleted) {
            return res.status(403).json({
                success: false,
                message: 'This account has been deleted. Please contact support.'
            });
        }

        // Handle deactivated account
        if (user.isDeactive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated.'
            });
        }

        if (model === 'User') {
            // If not verified, resend OTP
            if (!user.isVerify) {
                const OTP = Math.floor(100000 + Math.random() * 900000);
                const OTPExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

                user.loginOtp = OTP;
                user.loginOtpExpiredTime = OTPExpires;
                await user.save();

                await SendOtpWhatsapp(user.ContactNumber, OTP);

                return res.status(200).json({
                    success: true,
                    message: 'Your account is not verified. OTP has been sent to your WhatsApp.',
                    data: {
                        id: user._id,
                        isVerify: false,
                        ContactNumber: user.ContactNumber
                    }
                });
            }
        }



        // Verify password
        const isMatch = await user.comparePassword(Password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password.'
            });
        }

        // Successful login
        console.log(`Login successful for ${model}:`, user.Email || user.ContactNumber);
        return await SendToken(user, res, 200);

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message
        });
    }
};



exports.updateUserDeactive = async (req, res) => {
    try {
        const id = req.params._id;
        const { isDeactive } = req.body;
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User is not found'
            })
        }
        user.isDeactive = isDeactive;
        await user.save();
        var valueDeactive
        if (isDeactive === true) {
            valueDeactive = 'Deactive'
        } else {
            valueDeactive = 'Active'
        }
        const Param = [valueDeactive]
        await SendWhatsapp(user?.ContactNumber, 'userblockedbyadmin', Param)
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
        })

    } catch (error) {
        console.log("Internal server error in updating deactive status", error)
        res.status(500).json({
            success: false,
            message: ' Internal Server Error',
        })
    }
}

exports.ChangeOldPassword = async (req, res) => {
    try {
        const userId = req.params._id;
        const { Password, NewPassword } = req.body;

        if (!Password) {
            return res.status(400).json({
                success: false,
                message: 'Old Password is required'
            });
        }

        if (!NewPassword) {
            return res.status(400).json({
                success: false,
                message: 'New Password is required'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(Password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Enter Correct Old Password'
            });
        }

        user.Password = NewPassword;

        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.log("Internal server error in changing password")
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.logout = async (req, res) => {
    try {
        // Clearing cookies directly
        res.clearCookie('token'); // Replace 'token' with your cookie name
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error in user logout'
        });
    }
};

// Request to change password: Send OTP
exports.passwordChangeRequest = async (req, res) => {
    try {
        const { ContactNumber, NewPassword, Email } = req.body;
        console.log("Received request body:", req.body);

        if (!NewPassword || NewPassword.length <= 6) {
            console.log("Password too short");
            return res.status(400).json({
                success: false,
                message: 'Your new password must be longer than 6 characters. Please try again with a stronger password.'
            });
        }

        // Step 1: Check User collection
        let user = await User.findOne({
            $or: [{ ContactNumber }, { Email }]
        });
        console.log("User lookup in User model:", user);

        let model = 'User';

        // Step 2: If not found in User, check Vendor
        if (!user) {
            user = await Vendor.findOne({
                $or: [{ ContactNumber }, { Email }]
            });
            model = user ? 'Vendor' : null;
            console.log("User lookup in Vendor model:", user);
        }

        // Step 3: If still not found, return error
        if (!user) {
            console.log("No user found with given contact/email");
            return res.status(404).json({
                success: false,
                message: 'We couldn’t find an account with that contact number. Please check and try again.'
            });
        }

        // Step 4: Generate OTP and expiry time
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const OTPExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
        console.log("Generated OTP:", OTP);
        console.log("OTP expiry time:", OTPExpires);

        // Step 5: Update user object directly and save
        user.PasswordChangeOtp = OTP;
        user.OtpExpiredTime = OTPExpires;
        user.NewPassword = NewPassword;

        console.log("Saving user with OTP and new password...");
        await user.save();
        console.log("User saved successfully");

        // Step 6: Send OTP via WhatsApp
        try {
            console.log("Sending OTP via WhatsApp...");
            await SendOtpWhatsapp(user.ContactNumber, OTP);
            console.log("OTP sent successfully");
        } catch (sendError) {
            console.error("Error sending OTP:", sendError);
            return res.status(500).json({
                success: false,
                message: 'There was an issue sending the OTP. Please try again later.'
            });
        }

        // Step 7: Respond with success
        return res.status(200).json({
            success: true,
            message: 'An OTP has been sent to your registered number.'
        });

    } catch (error) {
        console.error("Password change request error:", error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.'
        });
    }
};


// Verify OTP and change password
exports.verifyOtpAndChangePassword = async (req, res) => {
    const { ContactNumber, Email, PasswordChangeOtp, NewPassword } = req.body;
    console.log("Incoming request:", req.body);

    try {
        let user = await User.findOne({ $or: [{ ContactNumber }, { Email }] });
        let model = 'User';

        if (!user) {
            user = await Vendor.findOne({ $or: [{ ContactNumber }, { Email }] });
            model = user ? 'Vendor' : null;
        }

        console.log("Fetched user:", user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Log OTPs
        console.log("Stored OTP:", user.PasswordChangeOtp);
        console.log("Provided OTP:", PasswordChangeOtp);
        console.log("OTP Expiry Time:", user.OtpExpiredTime);
        console.log("Current Time:", new Date());

        // Validate OTP match and expiry
        const isOtpValid = user.PasswordChangeOtp === PasswordChangeOtp;
        const isOtpExpired = user.OtpExpiredTime < new Date();

        if (!isOtpValid || isOtpExpired) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP or OTP has expired'
            });
        }

        // Update password and clear OTP data
        user.Password = NewPassword;
        user.PasswordChangeOtp = undefined;
        user.OtpExpiredTime = undefined;
        user.NewPassword = undefined;

        await user.save();

        // Notify user
        if (user.ContactNumber) {
            await SendWhatsapp(user.ContactNumber, 'useandcor_password_changed');
        }

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Error in verifyOtpAndChangePassword:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};



// Resend OTP via email
exports.resendOtp = async (req, res) => {
    const { ContactNumber, Email } = req.body;

    try {
        // Step 1: Look for user in User and then Vendor
        let user = await User.findOne({ $or: [{ ContactNumber }, { Email }] });
        let model = 'User';

        if (!user) {
            user = await Vendor.findOne({ $or: [{ ContactNumber }, { Email }] });
            model = user ? 'Vendor' : null;
        }

        console.log("User Found in model:", model, "=>", user);

        // Step 2: If no user found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User or vendor not found with that Contact Number or Email'
            });
        }

        // Step 3: Generate and store OTP
        const OTP = Math.floor(100000 + Math.random() * 900000).toString();
        const OTPExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

        user.PasswordChangeOtp = OTP;
        user.OtpExpiredTime = OTPExpires;
        await user.save();

        console.log("OTP Generated:", OTP, "| Expires At:", OTPExpires);

        // Step 4: Send OTP via WhatsApp
        try {
            await SendOtpWhatsapp(user.ContactNumber, OTP);
        } catch (error) {
            console.error('Error sending OTP:', error);
            return res.status(500).json({
                success: false,
                message: 'There was an issue sending the OTP. Please try again later.'
            });
        }

        // Step 5: Success response
        res.status(200).json({
            success: true,
            message: 'New OTP sent successfully. Check your WhatsApp.'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};



exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Delete user
        await User.findByIdAndDelete(userId);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.log("Internal server error in deleting user")
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }
}


exports.addDeliveryDetails = async (req, res) => {
    try {
        const user = req.user;
        const userExist = await User.findById(user.id._id);

        if (!userExist) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Extract DeliveryAddress from req.body
        const { city, pincode, houseNo, street, nearByLandMark } = req.body;

        if (!city || !pincode || !houseNo || !street || !nearByLandMark) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Update user's DeliveryAddress
        userExist.DeliveryAddress = {
            City: city,
            PinCode: pincode,
            HouseNo: houseNo,
            Street: street,
            NearByLandMark: nearByLandMark,
        };

        // Save updated user
        await userExist.save();

        res.status(200).json({
            success: true,
            message: 'Delivery details added/updated successfully',
            user: userExist
        });
    } catch (error) {
        console.error('Error adding delivery details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


exports.GetDeliveryAddressOfUser = async (req, res) => {
    try {
        const user = req.user;
        const userExist = await User.findById(user.id._id);

        if (userExist) {
            const deliveryAddress = userExist.DeliveryAddress;
            return res.status(200).json({
                success: true,
                deliveryAddress: deliveryAddress
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('Error fetching delivery address:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery address'
        });
    }
};


exports.updateDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user.id._id; // Assuming req.user contains the authenticated user's ID

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        console.log(req.body)
        // Extract DeliveryAddress fields from req.body that are actually updated
        const { city, pincode, houseNo, street, nearByLandMark } = req.body;

        // Update user's DeliveryAddress fields only if they are provided in req.body
        if (city) user.DeliveryAddress.City = city;
        if (pincode) user.DeliveryAddress.PinCode = pincode;
        if (houseNo) user.DeliveryAddress.HouseNo = houseNo;
        if (street) user.DeliveryAddress.Street = street;
        if (nearByLandMark) user.DeliveryAddress.NearByLandMark = nearByLandMark;

        // Save updated user
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Delivery address updated successfully',
            user: user // Optionally, you can return the updated user object
        });
    } catch (error) {
        console.error('Error updating delivery address:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const allUser = await User.find()
        if (!allUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'All Users',
            data: allUser
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

exports.getSingleUserById = async (req, res) => {
    try {
        const id = req.params._id;

        // Check if the ID is a valid ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        // Query the database for the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User found',
            data: user
        });
    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error in fetching single user by ID',
            message: error.message
        });
    }
};


exports.updateUser = async (req, res) => {
    const uploadedImages = [];
    try {
        const id = req.params._id;
        const { companyName, FullName, RangeWhereYouWantService, ContactNumber, Email, address, PinCode, HouseNo, NearByLandMark } = req.body;

        console.log("body", req.body)

        const existingUser = await User.findById(id)
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User not found',
            })
        }

        existingUser.FullName = FullName;
        existingUser.ContactNumber = ContactNumber;
        existingUser.Email = Email;
        existingUser.address = address;
        existingUser.PinCode = PinCode;
        existingUser.HouseNo = HouseNo;
        // existingUser.Street = Street;
        existingUser.NearByLandMark = NearByLandMark;
        existingUser.companyName = companyName;
        // existingUser.RangeWhereYouWantService = RangeWhereYouWantService;
        if (RangeWhereYouWantService) {
            console.log("New RangeWhereYouWantService:", RangeWhereYouWantService);

            // Validate the new RangeWhereYouWantService
            const isValidRange = RangeWhereYouWantService.every((service, index) => {
                // console.log(`Checking service at index ${index}:`, service);

                const location = service?.location;
                // console.log(`Location:`, location);

                const type = location?.type;
                // console.log(`Type:`, type);

                const coordinates = location?.coordinates;
                // console.log(`Coordinates:`, coordinates);

                const isTypeValid = type === "Point";
                const areCoordinatesArray = Array.isArray(coordinates);
                const hasTwoCoordinates = areCoordinatesArray && coordinates.length === 2;
                const areCoordinatesValid = hasTwoCoordinates && coordinates.every(coord => coord !== "" && coord !== null && coord !== undefined);

                // console.log(`isTypeValid:`, isTypeValid);
                // console.log(`areCoordinatesArray:`, areCoordinatesArray);
                // console.log(`hasTwoCoordinates:`, hasTwoCoordinates);
                // console.log(`areCoordinatesValid:`, areCoordinatesValid);

                return isTypeValid && areCoordinatesArray && hasTwoCoordinates && areCoordinatesValid;
            });

            if (isValidRange) {
                const isDifferent = JSON.stringify(RangeWhereYouWantService) !== JSON.stringify(existingUser.RangeWhereYouWantService);

                if (isDifferent) {
                    existingUser.RangeWhereYouWantService = RangeWhereYouWantService;
                    // console.log("RangeWhereYouWantService updated.");
                } else {
                    console.log("No change detected in RangeWhereYouWantService.");
                }
            } else {
                console.warn("Invalid RangeWhereYouWantService format provided. Skipping update.");
            }
        }

        if (req.file) {
            if (existingUser.userImage.public_id) {
                await deleteImageFromCloudinary(existingUser.userImage.public_id)
            }
            const imgUrl = await uploadImage(req.file.path)
            const { image, public_id } = imgUrl;
            existingUser.userImage.url = image;
            existingUser.userImage.public_id = public_id;
            uploadedImages.push = existingUser.userImage.public_id
            try {
                fs.unlink(req.file.path)
            } catch (error) {
                console.log('Error in deleting file from local', error)
            }
        }
        // console.log('mid', existingUser)

        const userupdated = await existingUser.save()
        // console.log('aftersve', userupdated)

        if (!userupdated) {
            await deleteImageFromCloudinary(existingUser.userImage.public_id)
            return res.status(400).json({
                success: false,
                message: 'Failed to update user',
            })
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: userupdated
        })

    } catch (error) {
        console.log('Internal server error', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            message: error.message

        })
    }
}

exports.updateUserType = async (req, res) => {
    try {
        const id = req.params._id;
        const { UserType } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        user.UserType = UserType;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'User Type Updated',
            data: user
        })
    } catch (error) {
        console.log('Internal server error in updating user type', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error in updating user type',
            error: error.message
        })
    }
}


exports.universelLogin = async (req, res) => {
    try {
        const id = req.params._id;
        const user = await User.findById(id)
        if (!user) {
            const vendor = await Vendor.findById(id).populate('workingHour')
            return res.status(200).json({
                success: true,
                message: 'vendor is founded',
                data: vendor
            })
        }
        res.status(200).json({
            success: true,
            message: 'user is founded',
            data: user
        })
    } catch (error) {
        console.log('Internal server error in universel login', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error in universel login',
            error: error.message
        })
    }
}

exports.getMyDetails = async (req, res) => {
    try {
        const id = req.user.id?._id;
        const user = await User.findById(id)

        if (!user) {
            const vendor = await Vendor.findById(id).populate('workingHour memberShipPlan')
            return res.status(200).json({
                success: true,
                message: 'vendor is founded',
                data: vendor
            })
        }
        res.status(200).json({
            success: true,
            message: 'user is founded',
            data: user
        })
    } catch (error) {
        console.log('Internal server error in universel login', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error in universel login',
            error: error.message
        })
    }
}

exports.changeAMCStatus = async (req, res) => {
    try {
        const id = req.params._id;
        const { isAMCUser } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        user.isAMCUser = isAMCUser;
        const FullName = user?.FullName
        const updatedUser = await user.save();
        const Param = new URLSearchParams({
            FullName
        })
        await SendWhatsapp(user?.ContactNumber, 'userandcorpisAMC', Param)
        res.status(200).json({
            success: true,
            message: 'AMC Status Updated',
            data: updatedUser
        })
    } catch (error) {
        console.log('Internal server error in updating user type', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error in updating user type',
            error: error.message
        })
    }
}

exports.updateIsAMCUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAMCUser } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        user.isAMCUser = isAMCUser;
        const updatedUser = await user.save();
        res.status(200).json({
            success: true,
            message: 'AMC Status Updated',
            data: updatedUser
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

exports.registerCorporateuserByExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet data to JSON
        const users = xlsx.utils.sheet_to_json(sheet);

        // Save users to MongoDB
        await User.insertMany(users);

        res.status(200).json({ message: "Users registered successfully!" });
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }
}


exports.deleteMyAccounSoft = async (req, res) => {
    try {
        const id = req.params?.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        // Soft delete the user by setting isSoftDeleted to true
        user.isSoftDeleted = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
            data: user
        });

    } catch (error) {
        console.log("Internal server error in deleting account soft", error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error in deleting account soft',
            error: error.message
        })

    }
}