const Payment = require('../models/payment');
const User = require('../models/user');

exports.addPayment = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const {
			paymentType,
			paymentValue,
			paymentDate,
			paymentInfo,
			isPayable,
			isMonthlyPayable,
			paymentForCode
		} = req.body;
		const user = await User.findById(userId);
		let paymentForUser;
		// if (paymentType === 'قسط شهري') {
		// 	//اذا دخل انو قسط شهري بالفرونت رح ياخدو الموعد يلي دخلو ويطلعو اليوم ويحسبو قدي باقي ويعرصوه  في حال كان قابل للدفع بيظهر زر ادفع الان  اذا لا ما بيظهر
		// }
		if (isPayable === 1) {
			paymentForUser = await User.findOne({ qrcode: paymentForCode });
			if (!paymentForUser)
				return res
					.status(400)
					.json({ success: false, message: ' هذا الرمز غير موجود يرجى التأكد من صحة الرمز' });
		} else {
			paymentForUser = undefined;
		}
		if (paymentForUser !== undefined) {
			if (paymentType === 'دين لمتجر' && paymentForUser.role === 0) {
				return res
					.status(400)
					.json({ success: false, message: 'صاحب هذا الرمز ليس تاجر يرجى التأكد من صحة الرمز' });
			} else paymentForUser = paymentForUser._id;
		}
		let actDate = paymentDate ? new Date(paymentDate) : undefined;
		const payment = new Payment({
			paymentType,
			paymentValue,
			paymentDate: actDate,
			paymentInfo,
			isPayable,
			isMonthlyPayable,
			user: user._id,
			paymentForUser: paymentForUser
		});
		await payment.save();
		return res.status(201).json({ success: true, message: 'payment added', data: payment });
	} catch (error) {
		next(error);
	}
};

exports.getAllPayments = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const perPage = 9;
		const page = req.query.page || 1;
		const count = await Payment.countDocuments({ user: userId }); // count documents for user id
		if (count == 0) {
			res.status(400).json({ message: 'لا يوجد أي مدفوعات لعرضها' });
		} else {
			const allPayments = await Payment.find({ user: userId })
				.populate('user', 'firstName lastName')
				.populate('paymentForUser', 'firstName lastName qrcode')
				.sort({ paymentDate: -1 })
				.skip(perPage * page - perPage)
				.limit(perPage);

			const totalPages = Math.ceil(count / perPage);

			return res.status(200).json({
				success: true,
				message: 'All payments retrieved successfully',
				data: allPayments,
				currentPage: page,
				totalPages: totalPages,
				totalItems: count
			});
		}
	} catch (error) {
		next(error);
	}
};

exports.deletePayment = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const paymentId = req.params.id;

		const payment = await Payment.findOneAndDelete({
			_id: paymentId,
			user: userId
		});

		if (!payment) {
			return res.status(404).json({ success: false, message: 'Payment not found or unauthorized' });
		}

		return res.status(200).json({
			success: true,
			message: 'Payment deleted successfully',
			data: payment
		});
	} catch (error) {
		next(error);
	}
};
