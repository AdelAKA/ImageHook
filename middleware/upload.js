require('dotenv').config()
const crypto = require('crypto');
const path = require('path');
const multer = require('multer')
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({

    url: process.env.MONGO_URI,
    file: (req, file) => {
        // console.log(file)
        const match = ["image/png", "image/jpeg"]

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}` + buf.toString('hex') + path.extname(file.originalname);
            return filename
        }

        // console.log(req)

        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = `${Date.now()}` + buf.toString('hex') + path.extname(file.originalname);

                req.tempFilename = filename;

                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                };
                resolve(fileInfo);
            });
        });
    }
});

module.exports = multer({ storage });