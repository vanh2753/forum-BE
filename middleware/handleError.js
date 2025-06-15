const handleError = (err, req, res, next) => {
    console.error('Server Error >>> ', err);
    res.status(err.status || 500).json({
        EM: err.message || 'Internal Server Error'
    });
};

module.exports = handleError;