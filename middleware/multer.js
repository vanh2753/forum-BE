const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hãy upload hình ảnh !'), false);
        }
    }
})

const uploadPdf = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('application/pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Hãy upload file PDF !'), false);
        }
    }
})

module.exports = { upload, uploadPdf } 