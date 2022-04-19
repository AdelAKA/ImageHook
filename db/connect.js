const mongoose = require('mongoose')

const Grid = require('gridfs-stream');

// const connectDB = (url) => {
//     return mongoose.connect(url)
// }

const connectDB = (url) => {
    return mongoose.connect(url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log(err))
}

module.exports = connectDB