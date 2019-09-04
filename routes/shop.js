const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');
const getCartCount = require('../middleware/get-cart');

const router = express.Router();

router.get('/', getCartCount, shopController.getIndex);

router.post('/search', getCartCount, shopController.postSearch);
router.get('/search', getCartCount, shopController.getSearch);

router.get('/products', getCartCount, shopController.getProducts);

router.get('/products/:productId', getCartCount, shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post(
  '/cart-update',
  isAuth,
  getCartCount,
  shopController.postProductCart
);
router.post('/cart', isAuth, getCartCount, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/checkout', isAuth, getCartCount, shopController.getCheckout);

router.post('/checkout', isAuth, getCartCount, shopController.postCheckout);

router.post(
  '/getOneClickCheckout',
  isAuth,
  getCartCount,
  shopController.getOneClickCheckout
);

router.get('/orders', isAuth, getCartCount, shopController.getOrders);

router.get('/orders/:orderId', isAuth, getCartCount, shopController.getInvoice);

module.exports = router;
