const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Product = require('../models/product');
const Order = require('../models/order');
const axios = require('axios');
const ITEMS_PER_PAGE = 2;

// checkout variables
let selectedDeliveryMethods = [
  'two-us-prime',
  'two-us-prime',
  'two-us-prime',
  'two-us-prime'
];
let shippingCost = 0;

const monthNames = [
  'Jan.',
  'Feb.',
  'Mar.',
  'Apr.',
  'May',
  'June',
  'July',
  'Aug.',
  'Sep.',
  'Oct.',
  'Nov.',
  'Dec.'
];
const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

var currentDate = new Date();
if (currentDate.getHours() < 18) {
  var primeDeliveryDate = currentDate.setDate(currentDate.getDate() + 2);
  primeDeliveryDate = currentDate;
  currentDate = new Date();
  var oneDayDelivery = currentDate.setDate(currentDate.getDate() + 1);
  oneDayDelivery = currentDate;
  currentDate = new Date();
} else {
  var primeDeliveryDate = currentDate.setDate(currentDate.getDate() + 3);
  primeDeliveryDate = currentDate;
  currentDate = new Date();
  var oneDayDelivery = currentDate.setDate(currentDate.getDate() + 2);
  oneDayDelivery = currentDate;
  currentDate = new Date();
}
// end of checkout variables

exports.getSearch = (req, res, next) => {
  res.render('shop/search', {
    pageTitle: 'Search',
    path: '/search',
    pictures: 0,
    cartCountTest: res.locals.cartCountTest
  });
};

exports.postSearch = (req, res, next) => {
  const search = req.body.search;
  let pictures;
  axios
    .get('https://api.unsplash.com/search/photos', {
      params: { query: search },
      headers: {
        Authorization:
          'Client-ID 1c2757b0782e0447e4f1d0e31f107365048b8b724dbd8445152a59af0ad6eabb'
      }
    })
    .then(response => {
      pictures = response.data.results;
      res.render('shop/search', {
        pageTitle: 'Search',
        path: '/search',
        pictures: pictures,
        cartCountTest: res.locals.cartCountTest
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        shopProducts: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  res.render('shop/index', {
    pageTitle: 'Shop',
    path: '/'
  });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const cartProducts = user.cart.items;

      let total = 0;
      let quantity = 0;
      cartProducts.forEach(p => {
        total += p.quantity * p.productId.price;
        quantity += p.quantity;
      });
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts,
        totalSum: total,
        cartCountTest: quantity
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postProductCart = (req, res, next) => {
  const qty = isNaN(parseInt(req.body.quantity))
    ? -1
    : parseInt(req.body.quantity);
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then(product => {
      if (qty === 0) {
        return req.user.removeFromCartUpdate(prodId);
      } else {
        return req.user.adjustCart(product, qty);
      }
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const qty = isNaN(parseInt(req.body.quantity))
    ? 1
    : parseInt(req.body.quantity);

  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product, qty);
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      let salesTax = total * 0.07;
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        monthNames: monthNames,
        dayNames: dayNames,
        currentDate: currentDate,
        primeDeliveryDate: primeDeliveryDate,
        oneDayDelivery: oneDayDelivery,
        selectedDeliveryDate: primeDeliveryDate,
        selectedDeliveryMethods: selectedDeliveryMethods,
        total: total,
        shippingCost: shippingCost,
        salesTax: salesTax,
        totalSum: total + shippingCost + salesTax
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCheckout = (req, res, next) => {
  let shipping = {
    'same-us-promo': 5.99,
    'two-us-prime': 0,
    'same-us-prime': 0
  };
  let shippingCost = 0;
  let selectedDeliveryMethods = [];

  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach((p, i) => {
        if (isNaN(shipping[req.body[`order${i}`]])) {
          selectedDeliveryMethods.push('two-us-prime');
          total += p.quantity * p.productId.price;
        } else {
          selectedDeliveryMethods.push(req.body[`order${i}`]);
          total +=
            p.quantity * p.productId.price + shipping[req.body[`order${i}`]];
          shippingCost += shipping[req.body[`order${i}`]];
        }
      });
      let salesTax = total * 0.07;

      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        monthNames: monthNames,
        dayNames: dayNames,
        currentDate: currentDate,
        primeDeliveryDate: primeDeliveryDate,
        oneDayDelivery: oneDayDelivery,
        selectedDeliveryDate: primeDeliveryDate,
        selectedDeliveryMethods: selectedDeliveryMethods,
        total: total,
        salesTax: salesTax,
        shippingCost: shippingCost,
        totalSum: total + salesTax + shippingCost
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express
  let totalSum = 0;

  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      user.cart.items.forEach(p => {
        totalSum += p.quantity * p.productId.price;
      });

      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: 'usd',
        description: 'Demo Order',
        source: token,
        metadata: { order_id: result._id.toString() }
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      console.log(
        'cartCountTest gets an error here because of not being able to find Kermit image. Image was uploaded from Heroku which does not permanently save images'
      );
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.product.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
    })
    .catch(err => next(err));
};

exports.getOneClickCheckout = (req, res, next) => {
  const qty = isNaN(parseInt(req.body.qty)) ? 1 : parseInt(req.body.qty);
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      if (prodId) {
        return req.user.addToCart(product, qty);
      }
    })
    .then(result => {
      return result.populate('cart.items.productId').execPopulate();
    })
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      let salesTax = total * 0.07;
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        monthNames: monthNames,
        dayNames: dayNames,
        currentDate: currentDate,
        primeDeliveryDate: primeDeliveryDate,
        oneDayDelivery: oneDayDelivery,
        selectedDeliveryDate: primeDeliveryDate,
        selectedDeliveryMethods: selectedDeliveryMethods,
        total: total,
        shippingCost: shippingCost,
        salesTax: salesTax,
        totalSum: total + shippingCost + salesTax
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
