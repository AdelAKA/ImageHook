const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    gfsImageId: {
        type: String,
        required: [true, "Image reference must be added"]
    },
    text: {
        type: String,
        required: [true, "You need to add a comment"]
    },
    createdByName: {
        type: String,
        required: [true, 'Please provide username']
    },
    createdById: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide userID']
    }
}, { timestamps: true })

module.exports = mongoose.model('Comment', CommentSchema)