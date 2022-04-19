const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')

const {
    displayHomePage,
    handleUpload,
    getSingleImage,
    deleteSingleImage,
    displayComments,
    addComment,
    deleteComment,
    displayDashboard,
    userLogout } = require('../controllers/c_main')

router.get('/dashboard', displayDashboard)
router.get('/logout', userLogout)
router.route('/index').get(displayHomePage).post(upload.single('file'), handleUpload)
router.route('/images/:filename').get(getSingleImage).delete(deleteSingleImage)
router.route('/files/:id').get(displayComments).post(addComment).delete(deleteComment)

module.exports = router