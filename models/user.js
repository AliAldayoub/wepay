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
		imgURL: { type: String },
		password: { type: String, required: true },
		pin: { type: String, required: true },
		role: { type: Number, enum: [ 0, 1, 2 ], default: 0 },
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
	do {
		uniqueNumber = Math.floor(100000 + Math.random() * 900000);
	} while (await User.findOne({ qrcode: uniqueNumber }));
	this.qrcode = uniqueNumber;
	if (!user.isModified('password')) return next();
	bcrypt.genSalt(10, (err, salt) => {
		if (err) return next(err);
		bcrypt.hash(user.password, salt, (err, hash) => {
			if (err) return next(err);
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.validatePassword = async function(password) {
	return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
