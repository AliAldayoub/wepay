const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dealerSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		fullName: { type: String, required: true },
		city: { type: String, required: true },
		address: { type: String, required: true },
		phoneNumber: { type: String, required: true },
		dealerImgURL: { type: String }
	},
	{
		timestamps: true
	}
);

const Dealer = mongoose.model('Dealer', dealerSchema);

module.exports = Dealer;
