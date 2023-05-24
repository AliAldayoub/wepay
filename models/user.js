const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const userSchema = new Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		middleName: { type: String },
		email: { type: String, required: true, unique: true },
		userName: { type: String, required: true, unique: true },
		phoneNumber: { type: String },
		imgURL: { type: String, default: '' },
		password: { type: String, required: true },
		pin: { type: String, required: true },
		role: { type: String, enum: [ 'user', 'admin', 'seller', 'dealer' ], default: 'user' },
		qrcode: { type: String, unique: true },
		bemoBank: { type: String, unique: true, sparse: true },
		syriatelCash: { type: String, unique: true, sparse: true },
		haram: { type: String, unique: true, sparse: true },
		Balance: { type: Number, default: 0 },
		totalIncome: { type: Number, default: 0 },
		totalPayment: { type: Number, default: 0 }
	},
	{
		timestamps: true
	}
);
userSchema.pre('save', async function(next) {
	const user = this;
	let uniqueNumber;
	if (this.qrcode === undefined) {
		do {
			uniqueNumber = Math.floor(100000 + Math.random() * 900000);
		} while (await User.findOne({ qrcode: uniqueNumber.toString() }));
		this.qrcode = uniqueNumber.toString();
	}
	if (!user.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(user.password, salt);
		user.password = hash;
		next();
	} catch (err) {
		return next(err);
	}
});

userSchema.methods.validatePassword = async function(password) {
	return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
