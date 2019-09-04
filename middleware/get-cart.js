module.exports = async (req, res, next) => {
  let quantity = 0;
  if (req.user === undefined) {
    next();
    return (res.locals.cartCountTest = '');
  }

  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items;
    products.forEach(p => {
      quantity += p.quantity;
    });
    res.locals.cartCountTest = quantity;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
  next();
};
