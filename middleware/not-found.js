const notFound = (req, res) => {
    res.status(404).send(`Route does not exist - ${req.path}<br><a href="/api/v1/auth/welcome">Welcome Page</a>`)
}

module.exports = notFound