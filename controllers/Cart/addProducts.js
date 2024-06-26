const moment = require('moment');

const db = require('../../dbconfig');

const AppError = require('../../Utils/appError');
const catchAsync = require('../../Utils/catchAsync');

const getProductFromCart = async (empId, variantId, productId) => {
  const query =
    'SELECT azst_quantity FROM azst_cart WHERE azst_customer_id=? AND azst_variant_id=? AND azst_product_id=? AND status=1';
  const result = await db(query, [empId, variantId ?? 0, productId]);
  return { isExist: result.length > 0, quantity: result[0]?.azst_quantity };
};

const updateProductQuantity = async (values) => {
  const query =
    'UPDATE azst_cart SET azst_quantity=? WHERE azst_customer_id=? AND azst_variant_id=?';
  await db(query, values);
};

const addProductToCart = async (values) => {
  const query =
    'INSERT INTO azst_cart (azst_product_id, azst_variant_id, azst_quantity, azst_customer_id, createdon) VALUES (?, ?, ?, ?, ?)';
  await db(query, values);
};

const addpRoductToCart = catchAsync(async (req, res, next) => {
  const { cartProducts } = req.body;

  for (const product of cartProducts) {
    try {
      const { isExist, quantity } = await getProductFromCart(
        req.empId,
        product.variantId,
        product.productId
      );
      if (isExist) {
        const updateQty = quantity + product.quantity;
        const values = [updateQty, req.empId, product.variantId];
        await updateProductQuantity(values);
      } else {
        const today = moment().format('YYYY-MM-DD HH:mm:ss');
        const values = [
          product.productId,
          product.variantId,
          product.quantity,
          req.empId,
          today,
        ];
        await addProductToCart(values);
      }
    } catch (err) {
      return next(new AppError(err.sqlMessage ? err.sqlMessage : '', 400));
    }
  }
  res.status(200).json({ message: 'added to cart successfully' });
});

module.exports = addpRoductToCart;
