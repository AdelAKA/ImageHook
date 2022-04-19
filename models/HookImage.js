const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    gfsFilename: {
        type: String,
        required: [true, "imagename must be provided"]
    },
    privacy: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    createdByName: {
        type: String,
        ref: 'User.username',
        required: [true, 'Please provide username']
    },
    createdById: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide userID']
    }
}, { timestamps: true })

module.exports = mongoose.model('HookImage', ImageSchema)