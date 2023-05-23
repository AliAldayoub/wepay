const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const dealersController = require('../controllers/dealers');

const multer = require('multer');
// const dealerStorage = multer.diskStorage({
// 	destination: function(req, file, cb) {
// 		cb(null, './uploads/dealersAvatar');
// 	},
// 	filename: function(req, file, cb) {
// 		cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
// 	}
// });
// const fileFilter = (req, file, cb) => {
// 	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
// 		cb(null, true);
// 	} else cb(null, false);
// };
// const dealerUpload = multer({
// 	storage: dealerStorage,
// 	limits: {
// 		fileSize: 1024 * 1024 * 5
// 	},
// 	fileFilter: fileFilter
// });

const storage = multer.memoryStorage();
const dealerUpload = multer({ storage: storage });
router.get('/getAllDealers', dealersController.getAllDealers);
router.post(
	'/addDealer',
	authMiddleware.authenticateUser,
	authMiddleware.authenticateAdmin,
	dealerUpload.single('dealerImgURL'),
	dealersController.addDealer
);

module.exports = router;
