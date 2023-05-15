const User = require('../models/user');
const Dealer = require('../models/dealer');

const dealerStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/dealersAvatar');
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});
const dealerUpload = multer({ storage: dealerStorage });

exports.getAllDealers = async (req, res, next) => {
	try {
		const perPage = 10;
		const page = req.query.page || 1;
		const count = await Dealer.countDocuments();
		if (count == 0) {
			res.status(200).json({ message: 'no dealer in site for now', role: req.user.role });
		} else {
			const dealers = await Dealer.find().skip(perPage * page - perPage).limit(perPage);
			const totalPages = Math.ceil(count / perPage);
			res.status(201).json({
				role: req.user.role,
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
		dealerUpload.single('dealerImageUrl')(req, res, async function(err) {
			if (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: 'Error uploading file' });
			}
			const dealerImageUrl = req.file ? req.file.path : undefined;
			const { fullName, address, phoneNumber, userName } = req.body;
			const user = await User.findOne({ userName });
			const dealer = new Dealer({
				user: user._id,
				fullName,
				address,
				phoneNumber,
				dealerImageUrl
			});
			dealer.save();
			res.status(200).json({ success: true, message: 'dealer add successfully', data: dealer });
		});
	} catch (error) {
		next(error);
	}
};
