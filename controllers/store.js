const User = require('../models/user');
const Seller = require('../models/seller');
exports.getAllStores = async (req, res, next) => {
	try {
		const allStores = await Seller.find().populate('user', 'qrcode');
		res.status(200).json({ success: true, data: allStores, role: req.user.role });
	} catch (error) {
		next(error);
	}
};
