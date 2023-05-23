const User = require('../models/user');
const Dealer = require('../models/dealer');
const B2 = require('backblaze-b2');
const b2 = new B2({
	applicationKeyId: 'efb748089fbb',
	applicationKey: '0051f44073512386ff287e9baa556fc0a08e6aa064'
});

exports.getAllDealers = async (req, res, next) => {
	try {
		const perPage = 10;
		const page = req.query.page || 1;
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
		let fileUrl;
		if (dealerImgURL) {
			await b2.authorize();

			const bucketId = 'be0fdb27c47830e8898f0b1b';
			const fileName = dealerImgURL.originalname;
			const fileData = dealerImgURL.buffer;
			const response = await b2.getUploadUrl(bucketId);
			console.log(
				'hellllllllllllllo',
				response.data.uploadUrl,
				'heeeeeeeeeeeeeey',
				response.data.authorizationToken
			);
			const uploadResponse = await b2.uploadFile({
				uploadUrl: response.data.uploadUrl,
				uploadAuthToken: response.data.authorizationToken,
				bucketId: bucketId,
				fileName: fileName,
				data: fileData
			});

			// console.log(uploadResponse);
			// const bucket = await b2.getBucketName(bucketId);
			const FileInfo = await b2.getFileInfo({ fileId: uploadResponse.data.fileId });
			console.log(FileInfo.data);
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
			dealerImgURL: fileUrl !== undefined ? fileUrl : `${user.firstName} ${user.lastName}`
		});
		dealer.save();
		res.status(200).json({ success: true, message: 'dealer add  successfully', data: dealer, user: accountUser });
	} catch (error) {
		next(error);
	}
};
