const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawRequestSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		processType: { type: String, required: true },
		reciverName: {
			type: String,
			required: function() {
				return this.processType === 'سحب-هرم';
			}
		},
		amountValue: { type: Number, required: true },
		reciverPhone: { type: String, required: true },
		reciverCity: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

const WithdrawRequest = mongoose.model('withdrawRequest', withdrawRequestSchema);

module.exports = WithdrawRequest;
