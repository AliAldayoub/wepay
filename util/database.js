const mongoose = require('mongoose');

mongoose.connect(
	'mongodb+srv://AliAldayoub:alooshDy111234@apidb.zqofb.mongodb.net/wepayDB?retryWrites=true&w=majority',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	}
);

const db = mongoose.connection;

module.exports = db;
