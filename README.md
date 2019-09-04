# Amazon-ShopSpree

### Visit https://shopspree-amz.herokuapp.com/ to see a working example of this app.

This is a shopping web application, similar to Amazon.com, that allows users to buy and post products online. The app is still a work in progress, but contains most of the important features of a shopping app. The next big task I plan on working on is making this website mobile friendly. However, in terms of style and functionality, in my opinion, this is a significant upgrade to my original ShopSpree website.

#### To download the files and use this app on your own computer, sign up to MongoDb, SendGrid, and Stripe to get your own passwords or API keys

Update MONGO_USER, MONGO_PASSWORD, and STRIPE_KEY with your own information in the following two files:

nodemon.json
package.json under scripts>start (line 11)

In Controllers/auth.js, update the SendGrid API key (line 14)

In the Views/Shop/checkout.ejs file, update the Stripe data-key with your own data key (line 24)

### Technologies used to create this site include:

1. Node.js - server side language used for the website
2. Javascript - includes ES6 syntax
3. HTML/CSS - includes responsiveness for mobile devices
4. Express - the Node.js framework that I used
5. EJS - The templating language I used for creating HTML markup
6. MongoDB/Mongoose - Used MongoDB to store data and Mongoose to facilitate the storing of said data
7. SendGrid - Email delivery platform used to send out emails to users when they sign up or change their passwords
8. Stripe - Online payment processing for internet businesses. Used Stripe's payment APIs to accept credit card payments

### Some important concepts covered from creating this website include:

- Model-View-Controller: the architectural pattern used for this website
- Dynamic Routes, using query parameters, extracting dynamic parameters, linking data to edit page
- Dynamic Content & Templating Engines
- Sessions and Cookies
- Advanced authentication (creating tokens)
- Server side error and validation handling (includes some front-end validation error handling too)
- File upload and download
