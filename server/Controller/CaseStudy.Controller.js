const CaseStudy = require('../Model/CaseStudy.Model');
const { uploadImage, deleteImageFromCloudinary } = require('../Utils/Cloudnary');

exports.createCaseStudy = async (req, res) => {
    try {
        const { title, smallDes, longDes, category, clientName, location, completionDate, isPublished, videoUrl } = req.body;
        console.log("I am hit")

        const newCaseStudy = new CaseStudy({
            title,
            smallDes,
            longDes, // Changed from longDesment to longDes to match schema
            category,
            clientName,
            location,
            completionDate,
            // technologiesUsed,
            isPublished,
            videoUrl
        });

        if (req.files) {
            // Handle files when using upload.any()
            const smallImageFile = req.files.find(file => file.fieldname === 'smallImage');
            const largeImageFile = req.files.find(file => file.fieldname === 'largeImage');

            if (smallImageFile) {
                const uploadImg = await uploadImage(smallImageFile.path);
                newCaseStudy.smallImage = {
                    url: uploadImg.image,
                    public_id: uploadImg.public_id
                };
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload small image'
                })
            }

            if (largeImageFile) {
                const uploadImg = await uploadImage(largeImageFile.path);
                newCaseStudy.largeImage = {
                    url: uploadImg.image,
                    public_id: uploadImg.public_id
                };
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload large image'
                })
            }
        }

        await newCaseStudy.save();
        res.status(200).json({
            success: true,
            message: 'Case study created successfully',
            data: newCaseStudy
        })
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.getAllCaseStudy = async (req, res) => {
    try {
        const caseStudies = await CaseStudy.find();
        if (!caseStudies) {
            return res.status(400).json({
                success: false,
                message: 'No case study found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Case studies found successfully',
            data: caseStudies
        })

    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.getSingleCaseStudy = async (req, res) => {
    try {
        const id = req.params.id;
        const caseStudy = await CaseStudy.findById(id);
        if (!caseStudy) {
            return res.status(400).json({
                success: false,
                message: 'Case study not found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Case study found successfully',
            data: caseStudy
        })
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.deleteCaseStudy = async (req, res) => {
    try {
        const id = req.params.id;
        const caseStudy = await CaseStudy.findByIdAndDelete(id);
        if (!caseStudy) {
            return res.status(400).json({
                success: false,
                message: 'Case study not found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Case study deleted successfully',
            data: caseStudy
        })
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.updateCaseStudy = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            smallDes,
            longDesment,
            category,
            clientName,
            location,
            completionDate,
            technologiesUsed,
            isPublished,
            videoUrl
        } = req.body;
        // console.log(title, smallDes, longDesment, category, clientName, location, completionDate, technologiesUsed, isPublished, videoUrl)

        const caseStudy = await CaseStudy.findById(id);
        if (!caseStudy) {
            return res.status(404).json({
                success: false,
                message: 'Case study not found'
            });
        }

        // Update fields
        caseStudy.title = title || caseStudy.title;
        caseStudy.smallDes = smallDes || caseStudy.smallDes;
        caseStudy.longDes = longDesment || caseStudy.longDes;
        caseStudy.category = category || caseStudy.category;
        caseStudy.clientName = clientName || caseStudy.clientName;
        caseStudy.location = location || caseStudy.location;
        caseStudy.videoUrl = videoUrl || caseStudy.videoUrl;
        caseStudy.completionDate = completionDate || caseStudy.completionDate;
        caseStudy.technologiesUsed = technologiesUsed || caseStudy.technologiesUsed;
        caseStudy.isPublished = isPublished !== undefined ? isPublished : caseStudy.isPublished;
        caseStudy.updatedAt = new Date();

        if (req.files) {
            // Handle files when using upload.any()
            const smallImageFile = req.files.find(file => file.fieldname === 'smallImage');
            const largeImageFile = req.files.find(file => file.fieldname === 'largeImage');

            if (smallImageFile) {
                if(caseStudy.smallImage?.public_id) {
                    await deleteImageFromCloudinary(caseStudy.smallImage.public_id);
                }
                const uploadImg = await uploadImage(smallImageFile.path);
                caseStudy.smallImage = {
                    url: uploadImg.image,
                    public_id: uploadImg.public_id
                };
            }

            if (largeImageFile) {
                if(caseStudy.largeImage?.public_id) {
                    await deleteImageFromCloudinary(caseStudy.largeImage.public_id);
                }
                const uploadImg = await uploadImage(largeImageFile.path);
                caseStudy.largeImage = {
                    url: uploadImg.image,
                    public_id: uploadImg.public_id
                };
            }
        }

        await caseStudy.save();

        res.status(200).json({
            success: true,
            message: 'Case study updated successfully',
            data: caseStudy
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};