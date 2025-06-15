const uploadImages = require('../../ultis/cloudinary')

const uploadImage = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files) {
            return res.status(400).json({ EC: 1, EM: 'Không có file ảnh' });
        }

        const { url } = await uploadImages(files); // folder tùy ý
        return res.status(200).json({ EM: 'Ảnh đã được upload', EC: 0, DT: url });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    uploadImage
}