const B2 = require('backblaze-b2');
const b2 = new B2({
	applicationKeyId: 'efb748089fbb',
	applicationKey: '0051f44073512386ff287e9baa556fc0a08e6aa064'
});

async function authorizeB2() {
	await b2.authorize();
}

module.exports = {
	b2,
	authorizeB2
};
