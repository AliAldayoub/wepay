const User = require('../models/user');
const Dealer = require('../models/dealer');
const b2 = require('../util/backblazeB2');
exports.getAllDealers = async (req, res, next) => {
	try {
		const perPage = 10;
		const count = await Dealer.countDocuments();
		const user = await User.findOne({ _id: req.user._id }, '-password -pin');
		if (count == 0) {
			res.status(200).json({ message: 'no dealer in site for now', role: req.user.role, user });
		} else {
			const dealers = await Dealer.find();
			const totalPages = Math.ceil(count / perPage);

			res.status(201).json({
				user,
				role: req.user.role,
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
			await b2.authorize();

			const bucketId = process.env.bucketId;
			const fileName = Date.now() + '-' + dealerImgURL.originalname;
			const fileData = dealerImgURL.buffer;
			const response = await b2.getUploadUrl(bucketId);

			const uploadResponse = await b2.uploadFile({
				uploadUrl: response.data.uploadUrl,
				uploadAuthToken: response.data.authorizationToken,
				bucketId: bucketId,
				fileName: fileName,
				data: fileData
			});

			fileURL = `${process.env.baseURL}/${process.env.bucketName}/${fileName}`;

			// console.log(uploadResponse);
			// const bucket = await b2.getBucketName(bucketId);
		}
		const { fullName, address, phoneNumber, userName, city } = req.body;
		const user = await User.findOne({ userName });
		const accountUser = await User.findOne({ _id: req.user._id }, '-password -pin');
		const dealer = new Dealer({
			user: user._id,
			fullName,
			city,
			address,
			phoneNumber,
			dealerImgURL: fileURL !== undefined ? fileURL : process.env.defaultAvatar
		});
		dealer.save();
		res.status(200).json({ success: true, message: 'dealer add  successfully', data: dealer, user: accountUser });
	} catch (error) {
		next(error);
	}
};
