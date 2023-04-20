const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema(
	{
		sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		senderAction: { type: String, enum: [ 'دفع المتجر', 'تحويل', 'سحب' ], required: true },
		reciverAction: { type: String, enum: [ 'استلام رصيد', 'شحن' ], required: true },
		senderDetails: { type: String },
		reciverDetails: { type: String },
		amountValue: { type: Number, required: true },
		reciver: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: function() {
				return this.action === 'استلام رصيد' || this.action === 'تحويل' || this.action === 'دفع المتجر';
			}
		},
		status: { type: Boolean, required: true }
	},
	{
		timestamps: true
	}
);

const Activity = mongoose.model('activity', activitySchema);

module.exports = Activity;
