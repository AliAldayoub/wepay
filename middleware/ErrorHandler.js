const ErrorHandler = (err, req, res, next) => {
	console.log('Middleware Error Hadnling');
	console.log(err);
	const errStatus = err.statusCode || 500;
	const errMsg = err.message || 'Something went wrong';
	res.status(errStatus).json({
		success: false,
		status: errStatus,
		message: errMsg,
		stack: err.stack
	});
};

module.exports = ErrorHandler;
