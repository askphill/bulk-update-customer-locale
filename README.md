# Bulk edit customer's locale / default language

This repository addresses a common Shopify issue: the inability to bulk update customers' default languages. By default, Shopify sets all imported customers to the store's default language, ignoring their original language settings from another store. Although there's no `locale` property directly available, this tool uses the Admin API to send the necessary updates. It automates the process of updating customer languages, making it useful for post-migration adjustments or correcting default language settings for existing customers.

## Prerequisites

1. **Node Version Manager (nvm):** Ensure you have nvm installed to manage Node.js versions.
2. **Ngrok Account:** Create an account on [ngrok](https://ngrok.com/) to obtain the right API keys for creating secure tunnels.
3. **Shopify API Credentials:** Create a private app in your Shopify store to obtain the necessary Admin API credentials (API key and Admin API access token) to read and write customers. See tutorial [here](https://help.plytix.com/en/getting-api-credentials-from-your-shopify-store).

## Setup instructions

### 1. Switch Node Version

Use the specified Node.js version required for the project.

```
nvm use
```

### 2. Install dependencies

Install all necessary npm packages.

```
npm i
```

### 3. Start Ngrok tunnel

Create an ngrok tunnel for local development. This will generate a unique URL.

```
ngrok http 3000
```

### 5. Set .env variables

In the root directory, create a `.env` file and update with the right details:

```
SHOPIFY_SHOP_NAME=<add shop name here>
SHOPIFY_APP_VERSION=<add app version here>
SHOPIFY_APP_ACCESS_TOKEN=<add app access token here>
NGROK_URL=<add ngrok url here>
```

### 6. Create the data file

In the root directory, go to the `data.jsonl` and populate it with the customer data in the [CustomerInput type format](https://shopify.dev/docs/api/admin-graphql/2024-04/mutations/customerupdate), ensuring it's in JSONL format. To export all customers and create the correct format, you can use [Matrixify](https://matrixify.app/documentation/customers/) and a tool like ChatGPT to help format the data. You should use a country code to for the locale field, this can either be set manually because you are migrating customers from a specific store, or use the customer's Address Country Code. See example below:

```
{ "input": { "id": "gid://shopify/Customer/2024050001", "locale": "EN" }}
{ "input": { "id": "gid://shopify/Customer/2024050002", "locale": "NL" }}
```

### 7. Run the app

> ⚠️ Only do this in production after you've tested it on a development store

Run the application to begin processing and updating customer languages.

```
npm run start
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
