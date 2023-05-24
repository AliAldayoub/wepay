const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticateUser = async (req, res, next) => {
	try {
		// const token = req.cookies.token;
		const token = req.headers.authorization.split(' ')[1];
		console.log(token);
		if (!token) {
			return res.status(401).json({ message: 'no token you can not access this route' });
		} else {
			const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
			const userId = decodedToken.userId;
			const user = await User.findById(userId);
			req.user = user;
			next();
		}
	} catch (error) {
		res.status(401).json({ message: 'Invalid or expired token' });
	}
};

exports.authenticateAdmin = (req, res, next) => {
	if (req.user.role !== 'admin') {
		return res
			.status(403)
			.json({ message: 'Forbidden: you do not have permission to perform this action as an admin' });
	}
	next();
};

exports.authenticateSeller = (req, res, next) => {
	if (req.user.role !== 'seller' || req.user.role !== 'admin') {
		return res
			.status(403)
			.json({ message: 'Forbidden: you do not have permission to perform this action as a Seller' });
	}
	next();
};
