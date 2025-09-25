const ProductEnquiry = require('../Model/ProductEnquiry.Model');

exports.createProductEnquiry = async (req, res) => {
    try {
        const { productId, name, email, message, phone } = req.body;
        if (!productId || !name || !email || !message || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const newEnquiry = new ProductEnquiry({
            productId,
            name,
            email,
            message,
            phone
        });
        await newEnquiry.save();
        res.status(201).json({
            success: true,
            message: "Product enquiry created successfully",
            data: newEnquiry
        })
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getAllProductEnquiry = async (req, res) => {
    try {
        const allEnquiries = await ProductEnquiry.find().populate('productId');
        if (!allEnquiries) {
            return res.status(404).json({
                success: false,
                message: "No enquiries found"
            })
        }
        res.status(200).json({
            success: true,
            data: allEnquiries
        })
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.deleteProductEnquiry = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Enquiry id is required"
            })
        }
        const enquiry = await ProductEnquiry.findById(_id);
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found"
            })
        }
        await ProductEnquiry.findByIdAndDelete(_id);
        res.status(200).json({
            success: true,
            message: "Enquiry deleted successfully"
        })
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getSingleProductEnquiry = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Enquiry id is required"
            })
        }
        const enquiry = await ProductEnquiry.findById(_id).populate('productId', 'name');
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found"
            })
        }
        res.status(200).json({
            success: true,
            data: enquiry
        })
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}