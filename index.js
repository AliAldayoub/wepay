require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

const ErrorHandler = require('./middleware/ErrorHandler');
const db = require('./util/database');
const authRoute = require('./routes/auth');
const storeRoute = require('./routes/store');
const paymentRoute = require('./routes/payment');
const transactionRoute = require('./routes/transaction');
const dealersRoute = require('./routes/dealers');
app.use(
	cors({
		origin: true,
		credentials: true
	})
);
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});
app.use(express.json());
app.use('/uploads', express.static('uploads', { fallthrough: false }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use('/api/v1.0/auth', authRoute);
app.use('/api/v1.0/store', storeRoute);
app.use('/api/v1.0/payment', paymentRoute);
app.use('/api/v1.0/transaction', transactionRoute);
app.use('/api/v1.0/dealers', dealersRoute);

app.get('/', (req, res, next) => {
	res.send('hello from we pay');
});

app.use(ErrorHandler);
db.on('error', console.error.bind(console, 'connection error : '));
db.once('open', () => {
	console.log('connected successfuly ');
});

app.listen(3000, () => {
	console.log('heey again on 3000');
});
