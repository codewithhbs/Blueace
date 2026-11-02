const TestVideo = require('../Model/testVideo.Model');
const { uploadVideo, deleteVideoFromCloudinary } = require('../Utils/Cloudnary');

exports.createTestVideo = async (req, res) => {
    try {
        if (req.file) {
            const uploadResult = await uploadVideo(req.file.path);
            const { video: videoUrl, public_id } = uploadResult;

            const newVideo = new TestVideo({
                video: {
                    url: videoUrl,
                    public_id: public_id
                }
            });

            await newVideo.save();

            res.status(200).json({
                success: true,
                message: 'Video Uploaded'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No video file provided'
            });
        }
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all videos
exports.getTestVideos = async (req, res) => {
    try {
        const videos = await TestVideo.find();
        res.status(200).json({
            success: true,
            data: videos
        });
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single video by ID
exports.getVideoById = async (req, res) => {
    try {
        const video = await TestVideo.findById(req.params.id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        res.status(200).json({
            success: true,
            data: video
        });
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update a video
exports.updateTestVideo = async (req, res) => {
    console.log('🚀 Incoming request to updateTestVideo');

    try {
        const videoId = req.params.id;
        // console.log(`🔍 Looking for TestVideo with ID: ${videoId}`);

        const updatedVideo = await TestVideo.findById(videoId);

        if (!updatedVideo) {
            // console.warn(`⚠️ No TestVideo found with ID: ${videoId}`);
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        if (req.file) {
            // console.log('📂 New video file received:', req.file.originalname);

            // Delete old video from Cloudinary
            if (updatedVideo.video.public_id) {
                // console.log(`🗑 Deleting old video from Cloudinary: ${updatedVideo.video.public_id}`);
                await deleteVideoFromCloudinary(updatedVideo.video.public_id);
            }

            // Upload new video to Cloudinary
            // console.log('⬆️ Uploading new video to Cloudinary...');
            const videofile = await uploadVideo(req.file.path);

            const { video: videoUrl, public_id } = videofile;
            // console.log('✅ New video uploaded:', videoUrl);
            // console.log('🔁 Updating video document in DB');

            // Update fields
            updatedVideo.video.url = videoUrl;
            updatedVideo.video.public_id = public_id;
        } else {
            console.log('ℹ️ No new video file provided in request');
        }

        // Save updated document
        await updatedVideo.save();
        // console.log('💾 Video document saved successfully');

        return res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: updatedVideo
        });

    } catch (error) {
        console.error('❌ Internal server error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete a video
exports.deleteTestVideo = async (req, res) => {
    try {
        const deletedVideo = await TestVideo.findById(req.params.id);

        if (!deletedVideo) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        if (deletedVideo.video.public_id) {
            await deleteVideoFromCloudinary(deletedVideo.video.public_id)
        }

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully',
            data: deletedVideo
        });
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getSingleVideo = async (req, res) => {
    try {
        const videos = await TestVideo.find();

        if (videos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No video found'
            });
        }

        const video = await TestVideo.findOne().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Video found',
            data: video
        });

    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
