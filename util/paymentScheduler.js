const cron = require('node-cron');
const Payment = require('../models/payment');

cron.schedule('0 0 * * *', async () => {
	try {
		const currentDate = new Date();
		const payments = await Payment.find({ isMonthlyPayable: 1, paidStatus: true });

		for (const payment of payments) {
			const paymentDay = payment.paymentDate.getDate();
			const nextPaymentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), paymentDay);

			if (currentDate > nextPaymentDate) {
				payment.paidStatus = false;
				await payment.save();
			}
		}
		console.log('Payment statuses updated successfully');
	} catch (error) {
		console.error('Error updating payment statuses:', error);
	}
});
