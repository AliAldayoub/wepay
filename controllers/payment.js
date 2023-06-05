const Payment = require('../models/payment');
const User = require('../models/user');
const Activity = require('../models/activity');

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
			if (paymentType === 'دين لمتجر' && paymentForUser.role === 'user') {
				return res
					.status(400)
					.json({ success: false, message: 'صاحب هذا الرمز ليس تاجر يرجى التأكد من صحة الرمز' });
			} else paymentForUser = paymentForUser._id;
		}
		const currentDate = new Date();
		let actDate = paymentDate ? new Date(paymentDate) : undefined;
		let monthsDiff;
		let monthlyPaymentAmount;
		if (paymentType === 'قسط شهري' && isMonthlyPayable === 1) {
			monthsDiff =
				(actDate.getFullYear() - currentDate.getFullYear()) * 12 +
				(actDate.getMonth() - currentDate.getMonth());

			monthlyPaymentAmount = paymentValue / monthsDiff;
			if (monthsDiff < 2) {
				return res
					.status(400)
					.json({ message: 'لا يمكنك اختيار قسط شهري في حال كان التاريخ المحدد لا يتجاوز شهرين ' });
			}
		}
		const payment = new Payment({
			paymentType,
			paymentValue,
			paymentDate: actDate,
			paymentInfo,
			isPayable,
			isMonthlyPayable,
			numberOfMonthsLeft: monthsDiff,
			monthlyValue: monthlyPaymentAmount,
			user: user._id,
			paymentForUser: paymentForUser
		});
		await payment.save();
		const countPayment = await Payment.countDocuments({ user: userId });
		let lastPayments;
		if (countPayment !== 0) {
			lastPayments = await Payment.find({ user: userId })
				.populate('user', 'firstName lastName')
				.populate('paymentForUser', 'firstName lastName qrcode')
				.sort({ paymentDate: 1 })
				.limit(3);
		}
		return res.status(201).json({ success: true, message: 'payment added', data: payment, lastPayments });
	} catch (error) {
		next(error);
	}
};

exports.getAllPayments = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const perPage = 9;
		const page = req.query.page || 1;
		const count = await Payment.countDocuments({ user: userId });
		if (count == 0) {
			res.status(200).json({ message: 'لا يوجد أي مدفوعات لعرضها' });
		} else {
			const allPayments = await Payment.find({ user: userId })
				.populate('user', 'firstName lastName')
				.populate('paymentForUser', 'firstName lastName qrcode')
				.sort({ createdAt: -1 });

			const updatedPayments = allPayments.map((payment) => {
				if (payment.isMonthlyPayable === 1) {
					const currentDate = new Date();
					const nextMonthDate = new Date(
						currentDate.getFullYear(),
						currentDate.getMonth() + 1,
						payment.paymentDate.getDate()
					);
					const timeDiff = nextMonthDate - currentDate;
					const daysDiff = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
					return { ...payment._doc, daysDiff };
				}
				return payment;
			});

			const totalPages = Math.ceil(count / perPage);

			return res.status(200).json({
				success: true,
				message: 'All payments retrieved successfully',
				data: updatedPayments,
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
		const countPayment = await Payment.countDocuments({ user: userId });
		let lastPayments;
		if (countPayment !== 0) {
			lastPayments = await Payment.find({ user: userId })
				.populate('user', 'firstName lastName')
				.populate('paymentForUser', 'firstName lastName qrcode')
				.sort({ paymentDate: 1 })
				.limit(3);
		}
		return res.status(200).json({
			success: true,
			message: 'Payment deleted successfully',
			data: payment,
			lastPayments
		});
	} catch (error) {
		next(error);
	}
};

exports.payNow = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const paymentId = req.params.id;
		const user = await User.findById(userId);
		const payment = await Payment.findById(paymentId);
		const reciverUser = await User.findById(payment.paymentForUser);
		if (payment.isMonthlyPayable === 1) {
			if (user.Balance < payment.monthlyValue) {
				return res.status(400).json({ success: false, message: 'عذراً,رصيدك لا يكفي لإجراء هذه العملية' });
			}

			user.Balance -= payment.monthlyValue;
			user.totalPayment += payment.monthlyValue;

			reciverUser.Balance += payment.monthlyValue;
			reciverUser.totalIncome += payment.monthlyValue;

			payment.numberOfMonthsLeft -= 1;
		} else {
			if (user.Balance < payment.paymentValue) {
				return res.status(400).json({ success: false, message: 'عذراً,رصيدك لا يكفي لإجراء هذه العملية' });
			}
			//later if we need to check if the date is too late we should check the date and check if the user need to do it or want to delete the payment

			user.Balance -= payment.paymentValue;
			user.totalPayment += payment.paymentValue;

			reciverUser.Balance += payment.paymentValue;
			reciverUser.totalIncome += payment.paymentValue;
		}
		const activity = new Activity({
			sender: userId,
			reciver: reciverUser._id,
			senderAction: 'تحويل',
			reciverAction: 'استلام رصيد',
			senderDetails: `سداد ${payment.paymentType} لحساب ${reciverUser.firstName} ${reciverUser.lastName}`,
			reciverDetails: `استوفاء ${payment.paymentType} من  ${reciverUser.firstName} ${reciverUser.lastName}`,
			paymentValue: payment.paymentValue,
			status: true
		});
		await activity.save();

		payment.paidStatus = true;
		payment.isMonthlyPayable === 1 ? (payment.paymentValue -= payment.monthlyValue) : (payment.paymentValue = 0);

		await user.save();
		await reciverUser.save();
		await payment.save();
		const chartData = await Activity.aggregate([
			{
				$match: {
					sender: userId,
					senderAction: { $in: [ 'دفع المتجر', 'تحويل' ] },
					createdAt: {
						$gte: new Date('2023-01-01'),
						$lt: new Date('2024-01-01')
					}
				}
			},
			{
				$project: {
					month: { $month: '$createdAt' },
					amountValue: 1
				}
			},
			{
				$group: {
					_id: '$month',
					totalAmount: { $sum: '$amountValue' }
				}
			},
			{
				$sort: { _id: 1 }
			}
		]);
		res.status(200).json({
			message: 'تم الدفع بنجاح وخصم المبلغ من رصيد حسابك',
			activity,
			payment,
			user,
			chartData
		});
	} catch (error) {
		next(error);
	}
};
