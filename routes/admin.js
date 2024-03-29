const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const getCartCount = require('../middleware/get-cart');

const router = express.Router();

router.get('/add-product', isAuth, getCartCount, adminController.getAddProduct);

router.get('/products', isAuth, getCartCount, adminController.getProducts);

router.post(
  '/add-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  getCartCount,
  adminController.postAddProduct
);

router.get(
  '/edit-product/:productId',
  isAuth,
  getCartCount,
  adminController.getEditProduct
);

router.post(
  '/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  getCartCount,
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
