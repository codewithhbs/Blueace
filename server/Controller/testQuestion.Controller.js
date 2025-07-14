const TestQuestion = require('../Model/testQuestion.Model');

exports.createTestQuestion = async (req, res) => {
    try {
        const { question, options } = req.body;

        // Basic validation
        if (!question || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Question and at least 2 options are required'
            });
        }

        // Optional: Validate if at least one option is correct
        const hasCorrectOption = options.some(opt => opt.isCorrect === true);
        if (!hasCorrectOption) {
            return res.status(400).json({
                success: false,
                message: 'At least one option must be marked as correct'
            });
        }

        const newQuestion = new TestQuestion({ question, options });
        await newQuestion.save();

        res.status(201).json({
            success: true,
            message: 'Test question created successfully',
            data: newQuestion
        });
    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getAllQuestion = async (req,res) => {
    try {
        const allQuestion = await TestQuestion.find();
        if(!allQuestion){
            return res.staus(400).json({
                success: false,
                message: 'Internal server error'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Question founded',
            data: allQuestion
        })
    } catch (error) {
        console.log("Interrnal error server error",error)
        res.status(500).json({
            success:false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.getSingleQuestion = async (req,res) => {
    try {
        const {id} = req.params;
        const findQuestion = await TestQuestion.findById(id)
        if(!findQuestion){
            return res.status(400).json({
                success: false,
                message: 'Question not founded'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Question founded'
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.deleteQuestion = async(req,res) => {
    try {
        const {id} = req.params;
        const findQuestion = await TestQuestion.findByIdAndDelete(id);
        if(!findQuestion){
            return res.status(400).json({
                success: false,
                message:'No Question Found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Question Deleted'
        })
    } catch (error) {
        console.log("Internal server error",error)
        res.status(500).json({
            success: false,
            message:"Internal server error",
            error: error.message
        })
    }
}

exports.updateTestQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, options } = req.body;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Question ID is required'
            });
        }

        // Validate question and options
        if (!question || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Question and at least 2 options are required'
            });
        }

        const hasCorrectOption = options.some(opt => opt.isCorrect === true);
        if (!hasCorrectOption) {
            return res.status(400).json({
                success: false,
                message: 'At least one option must be marked as correct'
            });
        }

        // Find and update
        const updated = await TestQuestion.findByIdAndUpdate(
            id,
            { question, options },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Test question updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};