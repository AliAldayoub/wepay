const User = require('../models/user');
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
		res.status(201).json({ success: true, message: 'All dealers Are retrieved successfully', data: dealers });
	} catch (error) {
		next(error);
	}
};
