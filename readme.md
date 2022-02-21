# Maytapi - WhatsApp Api Bot Example

> A simple nodejs bot for Maytapi WhatsApp Api

[Our Website](https://maytapi.com/) • [WhatsApp Api Documentations](https://maytapi.com/whatsapp-api-documentation)

- In this example we echo the text messages back to user.
- We use ngrok to create temporary https reverse proxy so whatsapp can reach our demo api.
- Because ngrok public url changes everytime we also change webhook settings in our account at boot. This should not be used like this in production environments.
- NOTE: Before testing the demo you need to create your phone instance and connect an active WhatsApp account to instance in [Phones Page](https://console.maytapi.com/).

# Installation

### Installing nodejs packages

`npm install`

### Configure Tokens

You need to change PRODUCT_ID, PHONE_ID and API_TOKEN values in app.js file. You can find your Product ID and Token in [Settings Token Page](https://console.maytapi.com/settings/token). Phone Id can be found in [Phones Page](https://console.maytapi.com/) or with `/listPhones` endpoint.

# Start The Api

Tested with nodejs v10.15.0

`npm start`

Now you can try the bot with sending test messages to your connected number.

You can test this bot with these preconfigured messages:

- media
- media64
- location
- reply
- link
- filepdf
- filedoc
- vcard
- contact
- product