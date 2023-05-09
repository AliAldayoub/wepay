const User = require('../models/user');
const Dealer = require('../models/dealer');
exports.getAllDealers = async (req, res, next) => {
	try {
		const perPage = 10;
		const page = req.query.page || 1;
		const count = await Dealer.countDocuments();
		if (count == 0) {
			res.status(200).json({ message: 'no dealer in site for now' });
		} else {
			const dealers = await Dealer.find().skip(perPage * page - perPage).limit(perPage);
			const totalPages = Math.ceil(count / perPage);
			res.status(201).json({
				success: true,
				message: 'All dealers Ae retrieved successfully',
				data: dealers,
				currentPage: page,
				totalPages: totalPages
			});
		}
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
