const User = require('../models/user');
const cookie = require('cookie');
const Seller = require('../models/seller');
const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
// const transporter = nodemailer.createTransport({
// 	service: 'gmail',
// 	host: 'sip2-267.nexcess.net',
// 	port: 587,
// 	secure: false,
// 	auth: {
// 		user: process.env.user,
// 		pass: process.env.pass
// 	}
// });
const profileDirectory = '../uploads/profilePictures';
if (!fs.existsSync(profileDirectory)) {
	fs.mkdirSync(profileDirectory, { recursive: true });
}
const sellerDirectory = '../uploads/storeImages';
if (!fs.existsSync(sellerDirectory)) {
	fs.mkdirSync(sellerDirectory, { recursive: true });
}
const profileStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/profilePictures');
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});

const profileUpload = multer({ storage: profileStorage });

const sellerStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/storeImages');
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});

const sellerUpload = multer({ storage: sellerStorage });

exports.signup = async (req, res, next) => {
	try {
		const { firstName, lastName, middleName, email, userName, phoneNumber, password, pin } = req.body;

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User with this email already exists' });
		}

		const hashedPin = await bcrypt.hash(pin, 10);

		const user = new User({
			firstName,
			lastName,
			middleName,
			email,
			userName,
			phoneNumber,
			password,
			pin: hashedPin
		});
		// const activationCode = Math.floor(Math.random() * 900000) + 100000;
		// const mailOptions = {
		// 	from: 'WE PAY',
		// 	to: user.email,
		// 	subject: 'Activate your account',
		// 	text: `Your activation code is ${activationCode}.`
		// };
		// await transporter.sendMail(mailOptions, (error, info) => {
		// 	if (error) console.log(error);
		// 	else console.log('mail sended');
		// });

		await user.save();
		const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
		res.setHeader(
			'set-Cookie',
			cookie.serialize('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 24 * 60 * 60 * 1000, // 24 hours
				sameSite: 'strict',
				path: '/'
			})
		);
		return res.status(201).json({ message: 'User created. Check your email for activation code.', token, user });
	} catch (error) {
		next(error);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, password, pin } = req.body;

		const user = await User.findOne({ email });
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
		res.setHeader(
			'set-Cookie',
			cookie.serialize('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 24 * 60 * 60 * 1000, // 24 hours
				sameSite: 'strict',
				path: '/'
			})
		);
		res.json({ token });
	} catch (error) {
		next(error);
	}
};

exports.updateBasic = async (req, res, next) => {
	try {
		const userId = req.user._id;
		profileUpload.single('imgURL')(req, res, async function(err) {
			if (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: 'Error uploading file' });
			}
			const { firstName, lastName, middleName, phoneNumber } = req.body;
			const imgURL = req.file ? req.file.path : undefined;
			const user = await User.findByIdAndUpdate(
				userId,
				{ firstName, lastName, middleName, phoneNumber, imgURL },
				{ new: true }
			);
			res.status(200).json({ success: true, message: 'User information updated successfully', data: user });
		});
	} catch (error) {
		next(error);
	}
};

exports.updateSecurity = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const { oldPassword, newPassword, newPin } = req.body;
		const user = await User.findById(userId);
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
		res.status(201).json({ message: 'security field updated' });
	} catch (error) {
		console.log(error);
		next(error);
	}
};

exports.updatePaymentInfo = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const { bemoBank, syriatelCash, haram } = req.body;
		const user = await User.findByIdAndUpdate(
			userId,
			{ bemoBank, syriatelCash, haram },
			{
				new: true,
				projection: {
					_id: 1,
					firstName: 1,
					lastName: 1,
					email: 1,
					userName: 1,
					role: 1,
					Balance: 1,
					totalIncome: 1,
					totalPayment: 1,
					bemoBank: 1,
					syriatelCash: 1,
					haram: 1
				}
			}
		);
		res.status(201).json({ success: true, message: 'User Payment information updated successfully', data: user });
	} catch (error) {
		next(error);
	}
};

exports.updateUserToSeller = async (req, res, next) => {
	try {
		const userId = req.user._id;
		sellerUpload.single('storeImgURL')(req, res, async function(err) {
			if (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: 'Error uploading file' });
			}
			const { storeName, address, coo, city, storeType } = req.body;
			const storeImgURL = req.file ? req.file.path : undefined;
			const seller = await new Seller({
				user: userId,
				storeName,
				address,
				coo,
				city,
				storeType,
				storeImgURL
			});
			await seller.save();
			const updatedUser = await User.findByIdAndUpdate(userId, { role: 1 }, { new: true });

			res.status(200).json({
				success: true,
				message: 'Seller information created successfully',
				data: { seller, updatedUser }
			});
		});
	} catch (error) {
		next(error);
	}
};

exports.logout = (req, res) => {
	try {
		if (req.cookies.token) {
			res.setHeader(
				'set-Cookie',
				cookie.serialize('token', '', {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					maxAge: 24 * 60 * 60 * 1000, // 24 hours
					sameSite: 'strict',
					path: '/'
				})
			);
			res.status(200).json({ message: 'Logged out successfully' });
		} else {
			res.status(404).json({ message: 'token not in cookie' });
		}
	} catch (error) {
		next(error);
	}
};
