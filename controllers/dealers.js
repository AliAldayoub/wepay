const User = require('../models/user');
const Dealer = require('../models/dealer');
const { uploadImage } = require('../util/backblazeB2');

exports.getAllDealers = async (req, res, next) => {
	try {
		const perPage = 10;
		const count = await Dealer.countDocuments();
		if (count == 0) {
			res.status(200).json({ message: 'no dealer in site for now' });
		} else {
			const dealers = await Dealer.find().sort({ createdAt: 1 });
			const totalPages = Math.ceil(count / perPage);

			res.status(201).json({
				success: true,
				message: 'All dealers Ae retrieved successfully',
				data: dealers,
				totalPages: totalPages
			});
		}
	} catch (error) {
		next(error);
	}
};

exports.addDealer = async (req, res, next) => {
	try {
		const dealerImgURL = req.file ? req.file : undefined;
		let fileURL;
		if (dealerImgURL) {
			fileURL = await uploadImage(dealerImgURL);
		}
		const { fullName, address, phoneNumber, userName, city } = req.body;
		const user = await User.findOne({ userName });
		user.role = 'dealer';
		await user.save();
		// check if admin or seller..........
		const dealer = new Dealer({
			user: user._id,
			fullName,
			city,
			address,
			phoneNumber,
			dealerImgURL: fileURL !== undefined ? fileURL : process.env.defaultAvatar
		});
		dealer.save();
		res.status(200).json({ success: true, message: 'dealer add  successfully', data: dealer });
	} catch (error) {
		next(error);
	}
};
