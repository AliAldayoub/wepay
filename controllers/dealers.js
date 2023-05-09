const User = require('../models/user');
const Dealer = require('../models/dealer');
exports.getAllDealers = async (req, res, next) => {
	try {
		const perPage = 10;
		const page = req.query.page || 1;
		const dealers = await User.find(
			{ role: 3 },
			'firstName middleName lastName email imgURL qrcode phoneNumber syriatelCash haram'
		)
			.skip(perPage * page - perPage)
			.limit(perPage);
		res.status(201).json({ success: true, message: 'All dealers Ae retrieved successfully', data: dealers });
	} catch (error) {
		next(error);
	}
};
exports.addDealer = async (req, res, next) => {
	try {
		const { fullName, address, phoneNumber, dealerImgURL } = req.body;
		const dealer = new Dealer({
			fullName,
			address,
			phoneNumber
		});
		dealer.save();
		res.status(200).json({ success: true, message: 'dealer add successfully', data: dealer });
	} catch (error) {
		next(error);
	}
};
