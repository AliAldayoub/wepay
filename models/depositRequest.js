const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const depositRequestSchema = new Schema(
	{
		processType: { type: String, required: true },
		senderName: {
			type: String,
			required: function() {
				return this.processType === 'شحن-هرم';
			}
		},
		senderPhone: {
			type: String,
			required: function() {
				return this.processType === 'شحن-هرم' || this.processType === 'شحن-كاش';
			}
		},
		amountValue: { type: Number, required: true },
		processNumber: {
			type: String,
			required: function() {
				return this.processType === 'شحن-هرم' || this.processType === 'شحن-كاش';
			}
		},
		senderCity: {
			type: String,
			required: function() {
				return this.processType === 'شحن-هرم';
			}
		},
		accountID: {
			type: String,
			required: function() {
				return this.processType === 'شحن-بيمو';
			}
		},
		processImageUrl: {
			type: String,
			required: function() {
				return this.processType === 'شحن-هرم';
			}
		},

		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		activity: { type: Schema.Types.ObjectId, ref: 'Activity', required: true }
	},
	{
		timestamps: true
	}
);

const DepositRequest = mongoose.model('DepositRequest', depositRequestSchema);

module.exports = DepositRequest;
