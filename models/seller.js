const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sellerSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	storeName: { type: String, required: true },
	address: { type: String, required: true },
	coo: { type: Array, required: true },
	city: { type: String, required: true },
	storeType: { type: String, required: true },
	storeImgURL: { type: String },
	createdAt: { type: Date, default: Date.now }
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
