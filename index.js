require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Shopify = require('shopify-api-node');
const fs = require('fs');
const {
	RUN_BULK_MUTATION,
	CREATE_WEBHOOK_SUBSCRIPTION,
	CREATE_STAGED_UPLOADS,
	GET_CURRENT_BULK_OPERATION,
} = require('./gql');

// NOTE:
// This version was not properly tested, you can revert to the last commit to get the working version
// or you can try to fix it yourself if anything goes wrong

const shopify = new Shopify({
	shopName: process.env.SHOPIFY_SHOP_NAME, // The part before .myshopify.com
	apiVersion: process.env.SHOPIFY_APP_VERSION, // Something like "2021-04"
	accessToken: process.env.SHOPIFY_APP_ACCESS_TOKEN, // Your private app access token
});

const fileToBuffer = async (filename) => {
	let readStream = fs.createReadStream(filename);
	let chunks = [];
	return new Promise((res) => {
		readStream.on('data', (chunk) => {
			chunks.push(chunk);
		});

		readStream.on('close', () => {
			res(Buffer.concat(chunks));
		});
	});
};

const runBulk = async () => {
	const webhookList = await shopify.webhook.list();
	const bulkOperationWebhook = webhookList.find(
		(webhook) => webhook.topic === 'bulk_operations/finish'
	);
	if (bulkOperationWebhook) {
		await shopify.webhook.delete(bulkOperationWebhook.id);
	}

	await shopify.graphql(CREATE_WEBHOOK_SUBSCRIPTION, {
		topic: 'BULK_OPERATIONS_FINISH',
		webhookSubscription: {
			format: 'JSON',
			callbackUrl: `${process.env.NGROK_URL}/wait-for-webhook`, // Something like https://XXXX-XX-XX-XXX-XX.ngrok-free.app
		},
	});

	const stagedUpload = await shopify.graphql(CREATE_STAGED_UPLOADS, {
		input: {
			resource: 'BULK_MUTATION_VARIABLES',
			filename: 'bulk_op_vars',
			mimeType: 'text/jsonl',
			httpMethod: 'POST',
		},
	});

	const stagedUploadData = stagedUpload.stagedUploadsCreate.stagedTargets[0];
	const stagedUploadParams = stagedUploadData.parameters;
	const stagedUploadPath = stagedUploadParams.find(
		(param) => param.name === 'key'
	).value;

	const formData = new FormData();
	for (const { name, value } of stagedUploadParams) {
		formData.append(name, value);
	}
	const buffer = await fileToBuffer('./data.jsonl');
	const blob = new Blob([buffer], { type: 'text/jsonl' });
	formData.append('file', blob);

	await fetch(stagedUploadData.url, {
		method: 'POST',
		body: formData,
	}).then((response) => response.text());

	await shopify.graphql(RUN_BULK_MUTATION, {
		stagedUploadPath,
	});

	setInterval(async () => {
		// If, for some reason, the webhook is not triggered, we need this interval, to poll the status
		// This doesn't give the whole status, like updated amount, failed amount, only the enum: RUNNING, etc.
		// You can use id in result to query the result of the bulk operation
		const currentBulkOperation = await shopify.graphql(
			GET_CURRENT_BULK_OPERATION,
			{ type: 'MUTATION' }
		);

		console.log('currentBulkOperation', currentBulkOperation);
	}, 10000);
};

app.use(bodyParser.json());

app.post('/wait-for-webhook', async (req, res) => {
	const bulkData = await shopify.graphql(GET_BULK_OPERATION_BY_ID, {
		id: req.body.admin_graphql_api_id,
	});

	await fetch(bulkData.node.url)
		.then((res) => res.text())
		.then((res) => {
			const resultWriteStream = fs.createWriteStream('results.jsonl', {
				flags: 'a',
			});
			resultWriteStream.write(res);
			resultWriteStream.end();
		});
	res.status(200).json(null);
});

app.listen(3000, () => {
	console.log(`Example app listening on port 3000`);
});

runBulk();
