const User = require('../models/user');
const DepositRequest = require('../models/depositRequest');
const multer = require('multer');
const mongoose = require('mongoose');
const depositStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/depositProcesses');
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});
const depositUpload = multer({ storage: depositStorage });

exports.depositRequest = async (req, res, next) => {
	try {
		const userId = req.user._id;
		depositUpload.single('processImageUrl')(req, res, async function(err) {
			if (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: 'Error uploading file' });
			}
			const processImageUrl = req.file ? req.file.path : undefined;

			const { processType, senderName, senderPhone, amountValue, processNumber } = req.body;

			const session = await DepositRequest.startSession();
			session.startTransaction();

			const depositRequest = new DepositRequest({
				processType,
				senderName,
				senderPhone,
				amountValue,
				processNumber,
				processImageUrl,
				user: userId
			});

			await depositRequest.save({ session });

			await session.commitTransaction();
			session.endSession();

			return res.status(200).json({
				success: true,
				message: 'تم استلام طلبك بنجاح سوف يتم التحقق من العملية خلال 1 ساعة ',
				data: depositRequest
			});
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();

		next(error);
	}
};
exports.withdrawRequest = async (req, res, next) => {
	const { amountValue, processType, reciverName, reciverPhone, reciverCity } = req.body;
	const userId = req.user._id;

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const user = await User.findById(userId).session(session);
		const admin = await User.findOne({ role: 2 }).session(session);

		if (user.balance < amountValue) {
			return res.status(400).json({
				success: false,
				message: 'عذراً رصيدك الحالي لا يكفي لإجراء هذه العملية'
			});
		}
		user.balance -= amountValue;
		await user.save();

		admin.balance += amountValue;
		await admin.save();

		const withdrawRequest = new WithdrawRequest({
			amountValue,
			processType,
			reciverName,
			reciverPhone,
			reciverCity,
			user: userId
		});
		await withdrawRequest.save();

		await session.commitTransaction();
		session.endSession();

		return res.status(200).json({
			success: true,
			message: 'تم استلام طلبك بنجاح وسحب الرصيد من الحساب سوف يتم ارسال المبلغ خلال مدة أقصاها 24 ساعة',
			data: withdrawRequest
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();

		next(error);
	}
};
