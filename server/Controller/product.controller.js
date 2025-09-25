const ProductModel = require('../Model/Product.Model');
const { uploadImage, deleteImageFromCloudinary } = require('../Utils/Cloudnary');

exports.createProduct = async (req, res) => {
    const allPublicIds = [];
    try {
        const { title, smalldesc, longdesc, price, metaTitle, metaDescription } = req.body;
        if (!title || !smalldesc || !longdesc) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        const newProduct = new ProductModel({
            title,
            smalldesc,
            longdesc,
            price,
            metaTitle,
            metaDescription
        })
        if (req.files) {
            const { smallImage, largeImage } = req.files;
            if (smallImage && smallImage[0]) {
                const imgUrl = await uploadImage(smallImage[0]?.path);
                allPublicIds.push(imgUrl.public_id);
                newProduct.smallImage = { url: imgUrl.image, public_id: imgUrl.public_id };
            }
            if (largeImage && largeImage[0]) {
                const imgUrl = await uploadImage(largeImage[0]?.path);
                allPublicIds.push(imgUrl.public_id);
                newProduct.largeImage = { url: imgUrl.image, public_id: imgUrl.public_id };
            }
        }
        await newProduct.save();
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        })
    } catch (error) {
        console.log("Internal server error", error);
        if (allPublicIds.length) {
            // Code to delete images from Cloudinary using allPublicIds
            allPublicIds.forEach(async (public_id) => {
                try {
                    await deleteImageFromCloudinary(public_id);
                } catch (err) {
                    console.error(`Failed to delete image with public_id ${public_id}:`, err);
                }
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        })
    }
}

exports.getAllProducts = async (req, res) => {
    try {
        const allProduct = await ProductModel.find().sort({ createdAt: -1 });
        if (!allProduct.length) {
            return res.status(404).json({
                success: false,
                message: "No products found"
            })
        }
        res.status(200).json({
            success: true,
            data: allProduct
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

exports.getSingleProduct = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Product id is required"
            })
        }
        const product = await ProductModel.findById(_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }
        res.status(200).json({
            success: true,
            data: product
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

exports.deleteProduct = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Product id is required"
            })
        }
        const product = await ProductModel.findById(_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        if (product.smallImage && product.smallImage.public_id) {
            await deleteImageFromCloudinary(product.smallImage.public_id);
        }

        if (product.largeImage && product.largeImage.public_id) {
            await deleteImageFromCloudinary(product.largeImage.public_id);
        }

        await ProductModel.findByIdAndDelete(_id);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
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

exports.updateProduct = async (req, res) => {
    const allPublicIds = [];
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Product id is required"
            })
        }
        const product = await ProductModel.findById(_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }
        const { title, smalldesc, longdesc, price, metaTitle, metaDescription } = req.body;
        if (title) product.title = title;
        if (smalldesc) product.smalldesc = smalldesc;
        if (longdesc) product.longdesc = longdesc;
        if (price) product.price = price;
        if (metaTitle) product.metaTitle = metaTitle;
        if (metaDescription) product.metaDescription = metaDescription;
        if (req.files) {
            const { smallImage, largeImage } = req.files;
            if (smallImage && smallImage[0]) {
                if (product.smallImage && product.smallImage.public_id) {
                    await deleteImageFromCloudinary(product.smallImage.public_id);
                }
                const imgUrl = await uploadImage(smallImage[0]?.path);
                allPublicIds.push(imgUrl.public_id);
                product.smallImage = { url: imgUrl.image, public_id: imgUrl.public_id };
            }
            if (largeImage && largeImage[0]) {
                if (product.largeImage && product.largeImage.public_id) {
                    await deleteImageFromCloudinary(product.largeImage.public_id);
                }
                const imgUrl = await uploadImage(largeImage[0]?.path);
                allPublicIds.push(imgUrl.public_id);
                product.largeImage = { url: imgUrl.image, public_id: imgUrl.public_id };
            }
        }
        await product.save();
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: product
        })
    } catch (error) {
        console.log("Internal server error", error);
        if (allPublicIds.length) {
            // Code to delete images from Cloudinary using allPublicIds
            allPublicIds.forEach(async (public_id) => {
                try {
                    await deleteImageFromCloudinary(public_id);
                } catch (err) {
                    console.error(`Failed to delete image with public_id ${public_id}:`, err);
                }
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message
        })
    }
}

exports.updateProductActiveStatus = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Product id is required"
            })
        }
        const { active } = req.body;
        if (typeof active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Active status must be a boolean"
            })
        }
        const product = await ProductModel.findById(_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }
        product.active = active;
        await product.save();
        res.status(200).json({
            success: true,
            message: "Product active status updated successfully",
            product: product
        })
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: "Failed to update product active status",
            error: error.message
        })
    }
}

exports.getProductByName = async (req, res) => {
    try {
        const { title } = req.params;
        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Product title is required"
            })
        }
        const searchTitle = title.trim().toLowerCase();
        const product = await ProductModel.findOne({ 
            title: { $regex: new RegExp('^' + searchTitle.replace(/-/g, ' ') + '$', 'i')}
         });// Replacing dashes with spaces
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }
        res.status(200).json({
            success: true,
            data: product
        })
    }
    catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}