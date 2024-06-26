const router = require('express').Router();
const multer = require('multer');

const ordersCtrl = require('../../controllers/OrderCtrl/gettAllOrders');
const authCtrl = require('../../controllers/authController');

const key = process.env.JWT_SECRET_ADMIN;

router.use(authCtrl.protect(key));
router.use(multer().any());

router.post('/all', ordersCtrl.getAllOrdrs);

router.post('/order/details', ordersCtrl.getOrderDetails);

module.exports = router;
