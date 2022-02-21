const express = require('express');
const ngrok = require('ngrok');
const rp = require('request-promise-native');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

const INSTANCE_URL = 'https://api.maytapi.com/api';
const PRODUCT_ID = '';
const PHONE_ID = '';
const API_TOKEN = '';

if (!PRODUCT_ID || !PHONE_ID || !API_TOKEN) throw Error('You need to change PRODUCT_ID, PHONE_ID and API_KEY values in app.js file.');

async function send_message(body) {
	console.log(`Request Body:${JSON.stringify(body)}`);
	let url = `${INSTANCE_URL}/${PRODUCT_ID}/${PHONE_ID}/sendMessage`;
	let response = await rp(url, {
		method: 'post',
		json: true,
		body,
		headers: {
			'Content-Type': 'application/json',
			'x-maytapi-key': API_TOKEN,
		},
	});
	console.log(`Response: ${JSON.stringify(response)}`);
	return response;
}

async function setup_network() {
	let public_url = await ngrok.connect(3000);
	console.log(`Public Url:${public_url}`);
	let webhook_url = `${public_url}/webhook`;
	let url = `${INSTANCE_URL}/${PRODUCT_ID}/setWebhook`;
	let response = await rp(url, {
		method: 'POST',
		body: { webhook: webhook_url },
		headers: {
			'x-maytapi-key': API_TOKEN,
			'Content-Type': 'application/json',
		},
		json: true,
	});
	console.log(`Response: ${JSON.stringify(response)}`);
}

async function getCatalog() {
	let url = `https://api.maytapi.com/api/${PRODUCT_ID}/${PHONE_ID}/catalog`;
	let response = await rp(url, {
		method: 'GET',
		json: true,
		headers: {
			'x-maytapi-key': API_TOKEN,
			'Content-Type': 'application/json',
		},
	});
	if (response.data && response.success == true && response.data.length > 0) {
		let responseProductId = response.data[0].productId;
		return responseProductId;
	} else {
		console.log("You don't have a any product");
		return 0;
	}
}

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/sendMessage', async (req, res) => {
	let { message, to_number } = req.body;
	let response = await send_message({ type: 'text', message, to_number });
	res.send({ response });
});

app.post('/webhook', async (req, res) => {
	res.sendStatus(200);
	let { message, conversation, type } = req.body;
	if (type === 'message') {
		let { type, text, fromMe } = message;
		if (fromMe) return;
		if (type === 'text') {
			let body = {};
			let lower = text.toLowerCase();
			switch (lower) {
				case 'media':
					body = {
						type: 'image',
						text: 'Image Response',
						message: 'https://via.placeholder.com/140x100',
					};
					break;
				case 'media64': {
					const contents = fs.readFileSync('./maytapi.jpg', {
						encoding: 'base64',
					});
					body = {
						type: 'image',
						text: 'Base64 Image Response',
						message: `data:image/jpeg;base64,${contents}`,
					};
					break;
				}
				case 'location':
					body = {
						type: 'location',
						text: 'Echo - ' + text,
						latitude: '41.093292',
						longitude: '29.061737',
					};
					break;
				case 'link':
					{
						body = {
							type: 'link',
							message: 'https://maytapi.com/',
						};
					}
					break;
				case 'contact':
					{
						body = {
							type: 'contact',
							message: '905301234567@c.us',
						};
					}
					break;
				case 'vcard':
					body = {
						type: 'vcard',
						message: {
							displayName: 'John Doe',
							vcard:
								'BEGIN:VCARD\nVERSION:3.0\nFN;CHARSET=UTF-8:John Doe\nN;CHARSET=UTF-8:;John;Doe;;\nTEL;TYPE=CELL:+9051234567\nREV:2020-01-23T11:09:14.782Z\nEND:VCARD',
						},
					};
					break;
				case 'filedoc':
					body = {
						type: 'media',
						message: 'https://file-examples-com.github.io/uploads/2017/02/file-sample_100kB.doc',
					};
					break;
				case 'filepdf':
					body = {
						type: 'media',
						message: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
					};
					break;
				case 'reply':
					body = {
						type: 'text',
						message: 'this is reply text',
						reply_to: message._serialized,
					};
					break;
				case 'product': {
					let catalogId = await getCatalog();
					if (catalogId == 0) {
						body = {
							type: 'text',
							message: "You don't have a any product",
						};
					} else {
						body = {
							type: 'product',
							productId: `${catalogId}`,
						};
					}

					break;
				}
				default:
					body = { message: 'Echo - ' + text, type: 'text' };
			}
			body.to_number = conversation;
			await send_message(body);
		} else {
			console.log(`Ignored Message Type:${type}`);
		}
	} else if (type === 'status') {
		let { phone_id, status } = req.body;
		console.log(`Status of instance ${phone_id} changed to ${status}`);
		console.log(JSON.stringify(req.body, null, 2));
	} else if (type === 'error') {
		console.log('Error from the instance', JSON.stringify(req.body, null, 2));
	} else if (type === 'ack') {
		let { data } = req.body;
		for (let i = 0; i < data.length; i++) {
			console.log(`Your message with id ${JSON.stringify(data[i].msgId, null, 2)} was ${JSON.stringify(data[i].ackType, null, 2)}`);
		}
		console.log(JSON.stringify(req.body, null, 2));
	} else {
		console.log(`Unknow type: ${type}`, JSON.stringify(req.body, null, 2));
	}
});

app.listen(port, async () => {
	console.log(`Example app listening at http://localhost:${port}`);
	await setup_network();
});
