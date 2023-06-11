const User = require('../models/user');
const Seller = require('../models/seller');
const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Activity = require('../models/activity');
const { uploadImage } = require('../util/backblazeB2');
exports.signup = async (req, res, next) => {
	try {
		const { firstName, lastName, middleName, email, userName, phoneNumber, password, pin } = req.body;

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User with this email already exists' });
		}

		const hashedPin = await bcrypt.hash(pin, 10);
		console.log(process.env.defaultAvatar);
		const user = new User({
			firstName,
			lastName,
			middleName,
			email,
			userName,
			phoneNumber,
			password,
			pin: hashedPin,
			imgURL: process.env.defaultAvatar
		});
		// to  sending email here .......

		// end sending email
		await user.save();
		const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
		console.log(user.imgURL);
		return res.status(201).json({
			message: 'User created. Check your email for activation code.',
			success: true,
			role: user.role,
			imgURL: user.imgURL,
			token
		});
	} catch (error) {
		next(error);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, password, pin } = req.body;

		let user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid email' });
		}

		const isPasswordValid = await user.validatePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid  password' });
		}

		const isPinValid = await bcrypt.compare(pin, user.pin);
		if (!isPinValid) {
			return res.status(401).json({ message: 'Invalid PIN' });
		}

		const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);

		res
			.status(200)
			.json({ success: true, message: 'login successfully', role: user.role, token, imgURL: user.imgURL });
	} catch (error) {
		next(error);
	}
};

exports.updateBasic = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const { firstName, lastName, middleName, phoneNumber } = req.body;
		const imgURL = req.file ? req.file : undefined;
		let fileURL;
		if (imgURL) {
			fileURL = await uploadImage(imgURL);
		}
		const user = await User.findByIdAndUpdate(
			userId,
			{ firstName, lastName, middleName, phoneNumber, imgURL: fileURL !== undefined ? fileURL : this.imgURL },
			{ new: true }
		);
		res.status(201).json({ success: true, message: 'User information updated successfully', user });
	} catch (error) {
		next(error);
	}
};

exports.updateSecurity = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const { oldPassword, newPassword, newPin } = req.body;
		let user = await User.findById(userId);
		const isPasswordValid = await user.validatePassword(oldPassword);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid  password' });
		}
		let hashedPin;
		if (newPin !== undefined) {
			hashedPin = await bcrypt.hash(newPin, 10);
			user.pin = hashedPin;
		}
		if (newPassword !== undefined) user.password = newPassword;
		user.save();
		user = await User.findById(userId, '-password -pin');
		res.status(201).json({ message: 'security field updated', user });
	} catch (error) {
		next(error);
	}
};

exports.updatePaymentInfo = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const { bemoBank, syriatelCash, haram } = req.body;
		const data = {
			bemoBank,
			syriatelCash,
			haram
		};
		Object.entries(data).filter(async ([ key, value ]) => {
			if (value === undefined || value === '') {
				delete data[key];
			}
			if (key === 'bemoBank' || key === 'syriatelCash' || key === 'haram') {
				await User.updateOne({ _id: userId }, { $unset: { [key]: 1 } });
			}
		});
		const user = await User.findByIdAndUpdate(userId, data, { new: true });
		res.status(201).json({ success: true, message: 'User Payment information updated successfully', user });
	} catch (error) {
		next(error);
	}
};

exports.updateUserToSeller = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const { storeName, address, coo, city, storeType } = req.body;
		console.log(coo);
		const storeImgURL = req.file ? req.file : undefined;
		let fileURL;
		if (storeImgURL) {
			fileURL = await uploadImage(storeImgURL);
		}
		const existUser = await User.findById(userId);
		if (existUser.Balance < 5000) {
			return res.status(401).json({
				message: 'you dont have enough money to be a seller please recharge your account and try again'
			});
		} else {
			const admin = await User.findOne({ role: 'admin' });
			existUser.Balance -= 5000;
			existUser.totalPayment += 5000;
			admin.Balance += 5000;
			admin.totalIncome += 5000;
			existUser.save();
			admin.save();
			const activity = new Activity({
				sender: existUser._id,
				reciver: admin._id,
				senderAction: 'تحويل',
				reciverAction: 'استلام رصيد',
				senderDetails: `ترقية الحساب ل تاجر`,
				reciverDetails: `اجور ترقية حساب للمستخدم ${existUser.firstName} ${existUser.lastName}`,
				amountValue: 5000,
				status: true
			});
			activity.save();

			const seller = await new Seller({
				user: userId,
				storeName,
				address,
				coo,
				city,
				storeType,
				storeImgURL: fileURL !== undefined ? fileURL : process.env.defaultAvatar
			});
			await seller.save();

			let updatedUser = await User.findOneAndUpdate(
				{ _id: userId, role: { $nin: [ 'admin', 'seller' ] } },
				{ role: 'seller' },
				{ new: true }
			);

			if (!updatedUser) updatedUser = await User.findById(userId);
			res.status(200).json({
				success: true,
				message: 'Seller information created successfully',
				seller,
				user: updatedUser
			});
		}
	} catch (error) {
		next(error);
	}
};

exports.updateUserToAdmin = async (req, res, next) => {
	try {
		const { userName } = req.body;
		const updatedUser = await User.findOneAndUpdate({ userName }, { role: 'admin' }, { new: true });
		res.status(200).json({
			success: true,
			message: 'user Updated to Admin successfully',
			user: updatedUser
		});
	} catch (error) {
		next();
	}
};
exports.getUserInfo = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId, '-password -pin');
		res
			.status(200)
			.json({ success: true, message: 'user information retrived successfully', user, role: user.role });
	} catch (error) {
		next(error);
	}
};

exports.resetPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		const type = req.query.type;
		const user = await User.findOne({ email });
		if (user) {
			if (type == 'sendCode') {
				randomNumber = Math.ceil(Math.random() * 10000);
				console.log(randomNumber);
				return res.status(200).json({ message: 'check your email address for the code', randomNumber });
			} else if (type == 'reset') {
				const password = req.body.password;
				user.password = password;
				user.save();
				return res.status(201).json({ message: 'password updated successfully' });
			} else {
				return res.status(401).json({ message: 'error in the request try again' });
			}
		} else {
			return res.status(401).json({ message: 'email is invalid try again with valid email' });
		}
	} catch (error) {
		next(error);
	}
};
