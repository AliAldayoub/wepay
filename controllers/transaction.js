const User = require('../models/user');
const Seller = require('../models/seller');
const Activity = require('../models/activity');
const DepositRequest = require('../models/depositRequest');
const WithdrawRequest = require('../models/withdrawRequest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { uploadImage } = require('../util/backblazeB2');
const Payment = require('../models/payment');

exports.getShipping = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId, '-password -pin');
		const actions = await Activity.find(
			{
				$or: [ { sender: userId, senderAction: 'تحويل' }, { sender: userId, senderAction: 'دفع المتجر' } ]
			},
			'-reciver -reciverDetails'
		)
			.sort({ createdAt: -1 })
			.limit(5);

		res.status(200).json({
			success: true,
			message: 'last actions is up-to-date and retrieved successfully',
			user,
			actions
		});
	} catch (error) {
		next(error);
	}
};
exports.getDashboard = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId, '-password -pin');

		ActivityFilter = { $or: [ { sender: userId }, { reciver: userId } ] };

		const countActivities = await Activity.countDocuments(ActivityFilter);
		let lastActivities;
		if (countActivities !== 0) {
			lastActivities = await Activity.find(ActivityFilter).sort({ createdAt: -1 }).limit(5);
			// when you need to fetch the data from lastActivities first check the senderAction if is in [ 'دفع المتجر', 'تحويل', 'سحب' ] use the senderDetails else use reciverDetails
		}

		const countPayment = await Payment.countDocuments({ user: userId });
		let lastPayments;
		let updatedPayments;
		if (countPayment !== 0) {
			lastPayments = await Payment.find({ user: userId })
				.populate('user', 'firstName lastName')
				.populate('paymentForUser', 'firstName lastName qrcode')
				.sort({ paymentDate: 1 })
				.limit(3);
			updatedPayments = lastPayments.map((payment) => {
				if (payment.isMonthlyPayable === 1 || payment.paymentType === 'قسط شهري') {
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
		}

		// retrive chart information ....
		const chartData = await Activity.aggregate([
			{
				$match: {
					sender: userId,
					senderAction: { $in: [ 'دفع المتجر', 'تحويل' ] },
					status: true,
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
			success: true,
			message: 'dashboard retrived successfully',
			lastActivities,
			lastPayments: updatedPayments,
			user,
			chartData
		});
	} catch (error) {
		next(error);
	}
};
exports.getDaysChart = async (req, res, next) => {
	try {
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth();
		const userId = req.user._id;
		const chartData = await Activity.aggregate([
			// Match documents where sender is userId and senderAction is 'دفع المتجر' or 'تحويل'
			{
				$match: {
					sender: userId,
					senderAction: { $in: [ 'دفع المتجر', 'تحويل' ] },
					status: true,
					createdAt: {
						$gte: new Date(currentYear, currentMonth, 1), // Start of the month
						$lt: new Date(currentYear, currentMonth + 1, 1) // Start of the next month
					}
				}
			},
			// Extract day from createdAt
			{
				$project: {
					day: { $dayOfMonth: '$createdAt' },
					amountValue: 1
				}
			},
			// Group by day, calculate sum of amountValue for each group
			{
				$group: {
					_id: '$day',
					totalAmount: { $sum: '$amountValue' }
				}
			},
			// Sort by day in ascending order
			{
				$sort: { _id: 1 }
			}
		]);
		res.status(200).json({
			success: true,
			message: 'month chart retrived successfully',
			chartData
		});
	} catch (error) {
		next(error);
	}
};
exports.getHoursChart = async (req, res, next) => {
	try {
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth();
		const currentDay = new Date().getDate();
		const userId = req.user._id;

		const chartData = await Activity.aggregate([
			// Match documents where sender is userId and senderAction is 'دفع المتجر' or 'تحويل'
			{
				$match: {
					sender: userId,
					senderAction: { $in: [ 'دفع المتجر', 'تحويل' ] },
					status: true,
					createdAt: {
						$gte: new Date(currentYear, currentMonth, currentDay), // Start of the day (midnight)
						$lt: new Date(currentYear, currentMonth, currentDay + 1) // Start of the next day (midnight)
					}
				}
			},
			// Extract hour from createdAt
			{
				$project: {
					hour: { $hour: '$createdAt' },
					amountValue: 1
				}
			},
			// Group by hour, calculate sum of amountValue for each group
			{
				$group: {
					_id: '$hour',
					totalAmount: { $sum: '$amountValue' }
				}
			},
			// Sort by hour in ascending order
			{
				$sort: { _id: 1 }
			}
		]);
		res.status(200).json({
			success: true,
			message: 'day chart retrived successfully',
			chartData
		});
	} catch (error) {
		next(error);
	}
};
exports.depositRequest = async (req, res, next) => {
	const session = await DepositRequest.startSession();
	try {
		const userId = req.user._id;

		const processImageUrl = req.file ? req.file : undefined;
		let fileURL;
		if (processImageUrl) {
			fileURL = await uploadImage(processImageUrl);
		}

		const { processType, senderName, senderPhone, processNumber, accountID, senderCity } = req.body;
		let amountValue = parseInt(req.body.amountValue);
		session.startTransaction();
		const admin = await User.findOne({ role: 'admin' });
		const activity = new Activity({
			sender: admin._id,
			reciver: userId,
			senderAction: 'تحويل',
			reciverAction: 'شحن',
			senderDetails: `تحويل رصيد لطلب شحن من حساب ${req.user.firstName} ${req.user.lastName} `,
			reciverDetails: `طلب شحن رصيد الحساب`,
			amountValue,
			status: false
		});
		await activity.save();
		const depositRequest = new DepositRequest({
			accountID,
			processType,
			senderName,
			senderPhone,
			senderCity,
			amountValue,
			processNumber,
			processImageUrl: fileURL !== undefined ? fileURL : process.env.defaultAvatar,
			user: userId,
			activity: activity._id
		});

		await depositRequest.save({ session });

		await session.commitTransaction();
		session.endSession();
		const user = await User.findById(userId, '-password -pin');
		return res.status(200).json({
			success: true,
			message: 'تم استلام طلبك بنجاح سوف يتم التحقق من العملية خلال 1 ساعة ',
			data: depositRequest,
			activity,
			user
		});
	} catch (error) {
		session.endSession();
		next(error);
	}
};
exports.withdrawRequest = async (req, res, next) => {
	const { processType, reciverName, reciverPhone, reciverCity, accountID, cashType, pin } = req.body;
	let amountValue = parseInt(req.body.amountValue);
	const userId = req.user._id;

	let session = await mongoose.startSession();
	session.startTransaction();

	try {
		const user = await User.findById(userId).session(session);
		const admin = await User.findOne({ role: 'admin' }).session(session);
		const isPinValid = await bcrypt.compare(pin, user.pin);
		if (!isPinValid) {
			return res.status(401).json({
				success: false,
				message: 'رمز الحماية الخاص بك غير صحيح يرجى التأكد منه'
			});
		}
		if (user.Balance < amountValue) {
			return res.status(401).json({
				success: false,
				message: 'عذراً رصيدك الحالي لا يكفي لإجراء هذه العملية'
			});
		}
		user.Balance -= amountValue;
		user.totalPayment += amountValue;
		await user.save();

		admin.Balance += amountValue;
		admin.totalIncome += amountValue;
		await admin.save();
		const activity = new Activity({
			sender: userId,
			reciver: admin._id,
			senderAction: 'سحب',
			reciverAction: 'استلام رصيد',
			senderDetails: `سحب رصيد من الحساب عن طريق ${processType}`,
			reciverDetails: `طلبية سحب رصيد عن طريق ${processType}`,
			amountValue,
			status: false
		});
		await activity.save();
		const withdrawRequest = new WithdrawRequest({
			accountID,
			amountValue,
			processType,
			reciverName,
			reciverPhone,
			reciverCity,
			cashType,
			user: userId,
			activity: activity._id
		});
		await withdrawRequest.save();

		await session.commitTransaction();
		session.endSession();

		return res.status(200).json({
			success: true,
			message: 'تم استلام طلبك بنجاح وسحب الرصيد من الحساب سوف يتم ارسال المبلغ خلال مدة أقصاها 24 ساعة',
			data: withdrawRequest,
			activity,
			user
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();

		next(error);
	}
};

exports.transferMoney = async (req, res, next) => {
	let session;
	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const userId = req.user._id;
		const user = await User.findById(userId).session(session);
		const { qrcode, pin } = req.body;
		let amountValue = parseInt(req.body.amountValue);
		const recipientUser = await User.findOne({ qrcode }).session(session);
		if (!recipientUser) {
			return res.status(401).json({
				success: false,
				message: 'عذراً إن الرمز المدخل غير صحيح , يرجى التأكد من صحة الرمز والمحاولة مرة أخرى'
			});
		}
		if (user.Balance < amountValue) {
			return res.status(401).json({
				success: false,
				message: 'عذراً لا تملك الرصيد الكافي لإجراء هذه العملية , قم بشحن حسابك والمحاولة من جديد '
			});
		}
		const isPinValid = await bcrypt.compare(pin, user.pin);
		if (!isPinValid) {
			return res.status(401).json({
				success: false,
				message: 'رمز الحماية الخاص بك غير صحيح يرجى التأكد منه'
			});
		}

		user.Balance -= amountValue;
		user.totalPayment += amountValue;

		recipientUser.totalIncome += amountValue;
		recipientUser.Balance += amountValue;

		await user.save({ session });
		await recipientUser.save({ session });
		let senderAction, reciverAction, senderDetails, reciverDetails;

		if (recipientUser.role === 'seller') {
			const seller = await Seller.findOne({ user: recipientUser._id });
			const storeName = seller.storeName;

			senderAction = 'دفع المتجر';
			reciverAction = 'استلام رصيد';

			senderDetails = `دفع لمتجر ${storeName}`;
			reciverDetails = `استلام رصيد من ${user.firstName} ${user.lastName} `;
		} else {
			senderAction = 'تحويل';
			reciverAction = 'استلام رصيد';

			senderDetails = `تحويل رصيد لحساب ${recipientUser.firstName} ${recipientUser.lastName}`;
			reciverDetails = `استلام رصيد من ${user.firstName} ${user.lastName} `;
		}
		const activity = new Activity({
			sender: userId,
			reciver: recipientUser._id,
			senderAction,
			reciverAction,
			senderDetails,
			reciverDetails,
			amountValue,
			status: true
		});

		await activity.save();
		await session.commitTransaction();
		session.endSession();

		res.status(200).json({ success: true, message: 'تم التحويل بنجاح وخصم المبلغ من حسابك ', activity, user });
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		next(error);
	}
};

exports.getActions = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const perPage = 10;
		const page = req.query.page || 1;
		const actionType = req.query.actionType; // 'deposit', 'withdraw', 'transfer', 'storePaid', or 'balanceReceipt'

		let filter = {};
		if (actionType === 'deposit') {
			filter = { reciver: userId, reciverAction: 'شحن' };
		} else if (actionType === 'withdraw') {
			filter = { sender: userId, senderAction: 'سحب' };
		} else if (actionType === 'transfer') {
			filter = { sender: userId, senderAction: 'تحويل' };
		} else if (actionType === 'storePaid') {
			filter = { sender: userId, senderAction: 'دفع المتجر' };
		} else if (actionType === 'balanceReceipt') {
			filter = { reciver: userId, reciverAction: 'استلام الرصيد' };
		} else {
			filter = { $or: [ { sender: userId }, { reciver: userId } ] };
		}

		const actions = await Activity.find(filter).sort({ createdAt: -1 });

		const count = await Activity.countDocuments(filter);
		const totalPages = Math.ceil(count / perPage);
		if (count == 0) {
			return res.status(200).json({ success: false, message: 'لا يوجد أي أنشطة لعرضها' });
		} else {
			return res.status(200).json({
				success: true,
				message: actionType
					? `All ${actionType} Actions retrieved successfully`
					: `All Actions retrieved successfully`,
				data: actions,
				currentPage: page,
				totalPages: totalPages,
				totalItems: count
			});
		}
	} catch (error) {
		next(error);
	}
};

exports.depositResponse = async (req, res, next) => {
	const processId = req.params.id;
	const userId = req.user._id;
	let session;
	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const depositRequest = await DepositRequest.findById(processId).session(session);
		const activity = await Activity.findOne(depositRequest.activity).session();
		const reciver = await User.findById(depositRequest.user).session(session);
		const sender = await User.findById(userId).session(session);

		const amountValue = depositRequest.amountValue;

		activity.status = true;

		sender.totalPayment += amountValue;
		sender.Balance -= amountValue;

		reciver.Balance += amountValue;
		reciver.totalIncome += amountValue;

		await sender.save();
		await reciver.save();
		await activity.save();
		const actions = await Activity.find(
			{
				$or: [ { sender: userId, senderAction: 'تحويل' }, { sender: userId, senderAction: 'دفع المتجر' } ]
			},
			'-reciver -reciverDetails'
		)
			.sort({ updatedAt: -1 })
			.limit(5);
		await session.commitTransaction();
		session.endSession();
		res.status(200).json({
			success: true,
			message: 'تم التحويل بنجاح وخصم المبلغ من حسابك ',
			user: sender,
			reciver,
			activity,
			actions
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		next(error);
	}
};

exports.withdrawResponse = async (req, res, next) => {
	try {
		const processId = req.params.id;
		const withDrawRequest = await WithdrawRequest.findById(processId);
		const activity = await Activity.findOne(withDrawRequest.activity);

		activity.status = true;
		await activity.save();

		res.status(201).json({ success: true, message: ' تمت العملية بنجاح ', activity });
	} catch (error) {
		next(error);
	}
};
exports.getAllDepositRequest = async (req, res, next) => {
	try {
		const user = req.user._id;
		const count = await DepositRequest.countDocuments();
		if (count == 0) {
			res.status(200).json({ message: 'لا يوجد أي طلبات شحن لعرضها' });
		} else {
			const depositRequests = await DepositRequest.find().populate({
				path: 'activity',
				match: { status: false }
			});

			const filteredDepositRequests = depositRequests.filter((request) => request.activity !== null);
			if (filteredDepositRequests.length == 0) {
				return res.status(200).json({
					sucess: false,
					message: 'لا يوجد اي طلبات لعرضها'
				});
			}
			res.status(200).json({
				sucess: true,
				message: 'تم جلب جميع طلبات الشحن',
				depositRequests: filteredDepositRequests,
				user
			});
		}
	} catch (error) {
		next(error);
	}
};
exports.getAllWithdrawRequest = async (req, res, next) => {
	try {
		const user = req.user._id;
		const count = await WithdrawRequest.countDocuments();
		if (count == 0) {
			res.status(200).json({ message: 'لا يوجد أي طلبات شحن لعرضها' });
		} else {
			const withdrawRequest = await WithdrawRequest.find().populate({
				path: 'activity',
				match: { status: false }
			});
			const filteredWithdrawRequests = withdrawRequest.filter((request) => request.activity !== null);
			if (filteredWithdrawRequests.length == 0) {
				return res.status(200).json({
					sucess: false,
					message: 'لا يوجد اي طلبات لعرضها'
				});
			}
			res.status(200).json({
				sucess: true,
				message: 'تم جلب جميع طلبات السحب',
				withdrawRequest: filteredWithdrawRequests,
				user
			});
		}
	} catch (error) {
		next(error);
	}
};

exports.payForShoppingo = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const codesWithPrices = JSON.parse(req.body.codesWithPrices);
		const pin = req.body.pin;
		const user = await User.findById(userId);
		const isPinValid = await bcrypt.compare(pin, user.pin);
		if (!isPinValid) {
			return res.status(401).json({
				success: false,
				message: 'رمز الحماية الخاص بك غير صحيح يرجى التأكد منه'
			});
		}
		let sum = 0;
		codesWithPrices.forEach((obj) => {
			sum += obj.price;
		});
		if (sum <= user.Balance) {
			for (const codeObject of codesWithPrices) {
				const { code, price } = codeObject;
				const reciver = await User.findOne({ qrcode: code });
				user.Balance -= price;
				user.totalPayment += price;
				reciver.Balance += price;
				reciver.totalIncome += price;
				const seller = await Seller.findOne({ user: reciver._id });
				const storeName = seller.storeName;

				senderAction = 'دفع المتجر';
				reciverAction = 'استلام رصيد';

				senderDetails = `دفع لمتجر ${storeName}`;
				reciverDetails = `استلام رصيد من ${user.firstName} ${user.lastName} `;
				const activity = new Activity({
					sender: userId,
					reciver: reciver._id,
					senderAction,
					reciverAction,
					senderDetails,
					reciverDetails,
					amountValue: price,
					status: true
				});
				activity.save();
				user.save();
				seller.save();
			}
			res.status(201).json({
				success: true,
				message: 'تم الدفع بنجاح لجميع المتاجر وخصم المبلغ من حسابك '
			});
		} else {
			return res.status(400).json({
				success: false,
				message: 'عذراً لا تملك رصيد كاف لإتمام العملية يرجى تعبئة رصيدك والمحاولة مرة أخرى'
			});
		}
	} catch (error) {
		next(error);
	}
};
