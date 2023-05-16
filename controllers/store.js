const User = require('../models/user');
const Seller = require('../models/seller');
exports.getAllStores = async (req, res, next) => {
	try {
		let user;
		if (req.user.role !== 'guest') {
			user = req.user;
		}
		const allStores = await Seller.find().populate('user', 'qrcode');
		res.status(200).json({ success: true, data: allStores, role: req.user.role, user });
	} catch (error) {
		next(error);
	}
};
