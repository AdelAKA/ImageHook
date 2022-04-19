const mongoose = require('mongoose')

const ProfileSchema = mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Must include an owner id']
    },
    profilePictue: {
        type: mongoose.Types.ObjectId,
        ref: 'ImageHook',
        default: s
    }
})

module.exports = mongoose.model('Profile', ProfileSchema)