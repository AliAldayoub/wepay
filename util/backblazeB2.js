const B2 = require('backblaze-b2');
const b2 = new B2({
	applicationKeyId: 'efb748089fbb',
	applicationKey: '0051f44073512386ff287e9baa556fc0a08e6aa064'
});
async function uploadImage(image) {
	await b2.authorize();

	const bucketId = process.env.bucketId;
	const fileName = Date.now() + '-' + image.originalname;
	const fileData = image.buffer;
	const response = await b2.getUploadUrl(bucketId);

	await b2.uploadFile({
		uploadUrl: response.data.uploadUrl,
		uploadAuthToken: response.data.authorizationToken,
		bucketId: bucketId,
		fileName: fileName,
		data: fileData
	});

	fileURL = `${process.env.baseURL}/${process.env.bucketName}/${fileName}`;
	return fileURL;
}
module.exports = { b2, uploadImage };
