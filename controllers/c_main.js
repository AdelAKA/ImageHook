const mongoose = require('mongoose')
const User = require('../models/User')
const HookImage = require('../models/HookImage')
const Comment = require('../models/Comment')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const { StatusCodes } = require('http-status-codes')

// The Gridfs is a file stream tool, specified by mongoDB that helps storing
// and retrieving large files, like images in our case
const Grid = require('gridfs-stream');

// we creat a connection with the mongourl to access the images with gfs
let gfs;
const conn = mongoose.connection;
conn.once('open', function () {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads")
});

const displayHomePage = async (req, res) => {
    const image_files = await HookImage.find({})
    await gfs.files.find().toArray((err, files) => {
        //Check if files
        if (!files || files.length === 0) {
            res.render('index', { files: false })
        } else {
            // Filter is used here for 2 purposes:
            // - Some images are private, and if the current user isn't the
            //    owner, then these images must not be send to the view page
            // - Extra info needs to be added to the view page: 
            //    isImage, owner username etc...
            const filteredFiles = files.filter(file => {
                const imageInfo = image_files.find((img) =>
                    img.gfsFilename === file.filename
                )

                file.createdByName = imageInfo.createdByName
                file.createdById = imageInfo.createdById
                file.isImage = false;
                // Check if file is image
                if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                    file.isImage = true;
                }

                file.privacy = 'public'
                // Check if image is private
                if (imageInfo.privacy == 'private') {
                    file.privacy = 'private'
                    return imageInfo.createdById.toString() === req.user._id.toString()
                }
                return true
            })
            res.render('index', { files: filteredFiles, userID: req.user._id })
        }
    });
}

// The upload is invoked from the main function in /middleware/upload
// This function is just to add image info to HookImage model and
// redirect to index page with success
const handleUpload = async (req, res) => {
    if (req.tempFilename) {
        const imageStates = {
            gfsFilename: req.tempFilename,
            privacy: req.body.privacy || 'public',
            createdByName: req.user.username,
            createdById: req.user._id
        }
        const image = await HookImage.create({ ...imageStates })
        req.flash('success_msg', 'Image uploded successfuly');
    }

    res.redirect('index')
}

const getSingleImage = async (req, res) => {
    const file = await gfs.files.findOne({ filename: req.params.filename })

    // Check if file exist
    if (!file || file.length === 0) {
        // return res.status(404).json({ err: `No file exist with filename ${req.params.filename}` });
        throw new NotFoundError(`No file exists with filename ${req.params.filename}`)
    }

    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        const imageInfo = await HookImage.find({ gfsFilename: req.params.filename })
        // Check if image private and if user is the owner
        if (imageInfo.privacy === 'private' && imageInfo.createdById.toString() != req.user._id.toString()) {
            throw new UnauthenticatedError(`Not authorized to access image ${req.params.filename}`)
        }

        // create stream to read image 
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    } else {
        throw new BadRequestError(`Not an image`)
        // return res.status(404).json({
        //     err: 'Not an image'
        // })
    }
}

const deleteSingleImage = async (req, res) => {
    const tempFile = await gfs.files.findOne({ filename: req.params.filename })
    if (!tempFile || tempFile.length === 0) {
        // return res.status(StatusCodes.NOT_FOUND).json({ err: `No file exist with filename ${req.params.filename}` })
        throw new NotFoundError(`No image exists with filename ${req.params.filename}`)
    }
    // Check if current user is the owner
    const imageInfo = await HookImage.findOne({ gfsFilename: tempFile.filename })
    if (imageInfo.createdById.toString() != req.user._id.toString()) {
        throw new UnauthenticatedError(`Not authorized to delete image ${req.params.filename}`)
        // return res.status(StatusCodes.UNAUTHORIZED).json({
        //     err: `Not authorized to delete image: ${req.params.id}`
        // })
    }

    await gfs.files.findOneAndDelete({ filename: req.params.filename }, async (err, file) => {
        if (err) {
            throw new NotFoundError(`No image exists with filename ${req.params.filename}`)
            // return res.status(StatusCodes.NOT_FOUND).json({ err: err })
        }
        const tempFile = await HookImage.findOneAndDelete({ gfsFilename: file.value.filename })
    })
    req.flash('success_msg', 'Image deleted successfuly')
    res.redirect('../index')
}

const displayComments = async (req, res) => {
    // Get the image to diplay on the comments page
    const file = await gfs.files.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
    if (!file || file.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
            err: `No file exist with id ${req.params.id}`
        })
    }
    // Check if current user is authorized to view image
    const imageInfo = await HookImage.findOne({ gfsFilename: file.filename })
    if (imageInfo.privacy === 'private' && imageInfo.createdById.toString() != req.user._id.toString()) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            err: `Not authorized to view image: ${req.params.id}`
        })
    }
    let comments = await Comment.find({ gfsImageId: req.params.id }).sort('-createdAt')
    if (!comments || comments.length === 0) {
        comments = false
    }
    res.render('imageComments', { file: file, comments: comments, userID: req.user._id })
}

const addComment = async (req, res) => {
    const commentInfo = {
        gfsImageId: req.params.id,
        text: req.body.comment,
        createdByName: req.user.username,
        createdById: req.user._id
    }
    const comment = await Comment.create({ ...commentInfo })
    req.flash('success_msg', 'Comment added successfuly');
    res.redirect(req.originalUrl)
}

const deleteComment = async (req, res) => {
    const comment = await Comment.findOne({ gfsImageId: req.params.id })
    // Check if current user is owner of this comment
    if (comment.createdById.toString() != req.user._id.toString()) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            err: `Not authorized to delete comment ${req.params.id}`
        })
    }

    await Comment.deleteOne({ gfsImageId: req.params.id });

    req.flash('success_msg', 'Comment deleted successfuly')
    res.redirect(req.originalUrl)
}

const displayDashboard = (req, res) => {
    res.render('dashboard', {
        name: req.user.name
    })
}

const userLogout = (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out');
    res.redirect('../auth/login')
}

module.exports = {
    displayHomePage,
    handleUpload,
    getSingleImage,
    deleteSingleImage,
    displayComments,
    addComment,
    deleteComment,
    displayDashboard,
    userLogout,
}