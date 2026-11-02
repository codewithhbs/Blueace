const ClientLogo = require('../Model/ClientLogo.Model');
const { uploadImage, deleteVideoFromCloudinary } = require('../Utils/Cloudnary');

exports.creteClientLogo = async (req, res) => {
    try {
        if (req.file) {
            const imgUrl = await uploadImage(req.file.path);
            const { image, public_id } = imgUrl;
            const newClientLogo = new ClientLogo({
                logo: {
                    url: image,
                    public_id: public_id
                }
            })
            await newClientLogo.save();
            res.status(200).json({
                success: true,
                message: "Client logo created successfully"
            })
        }
    } catch (error) {
        console.log("Internal server error in creating client logo", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in creating client logo",
            error: error.message
        })
    }
}

exports.getAllClientLogos = async (req, res) => {
    try {
        const clientLogos = await ClientLogo.find();
        if (!clientLogos) {
            return res.status(404).json({
                success: false,
                message: "No client logos found"
            })
        }
        res.status(200).json({
            success: true,
            data: clientLogos
        })
    } catch (error) {
        console.log("Internal server error in getting client logos", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in getting client logos",
            error: error.message
        })
    }
}

exports.getSingleClientLogo = async (req, res) => {
    try {
        const { id } = req.params;
        const findClientLogo = await ClientLogo.findById(id);
        if (!findClientLogo) {
            return res.status(404).json({
                success: false,
                message: "Client logo not found"
            })
        }
        res.status(200).json({
            success: true,
            data: findClientLogo
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.deleteClientLogo = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteClientLogo = await ClientLogo.findById(id);
        if (!deleteClientLogo) {
            return res.status(404).json({
                success: false,
                message: "Client logo not found"
            })
        }
        if (deleteClientLogo.logo.public_id) {
            await deleteVideoFromCloudinary(deleteClientLogo.logo.public_id);
        }
        await ClientLogo.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Client logo deleted successfully"
        })
    } catch (error) {
        console.log("Internal server error in deleting client logo", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in deleting client logo",
            error: error.message
        })
    }
}

exports.updateClientLogo = async (req, res) => {
    try {
        const { id } = req.params;
        const findClientLogo = await ClientLogo.findById(id);
        if(!findClientLogo){
            return res.status(404).json({
                success: false,
                message: "Client logo not found"
            })
        }
        if (req.file) {
            if (findClientLogo.logo.public_id) {
                await deleteVideoFromCloudinary(findClientLogo.logo.public_id);
            }
            const imgUrl = await uploadImage(req.file.path);
            const { image, public_id } = imgUrl;
            findClientLogo.logo = {
                url: image,
                public_id: public_id
            }
            await findClientLogo.save();
            res.status(200).json({
                success: true,
                message: "Client logo updated successfully"
            })
        }

    } catch (error) {
        console.log("Internal server error in updating client logo", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in updating client logo",
            error: error.message
        })
    }
}