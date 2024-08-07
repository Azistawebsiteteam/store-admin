const Joi = require('joi');
const AppError = require('../Utils/appError');

const loginSchema = Joi.object({
  id: Joi.number().optional(),
  question: Joi.string().min(5).max(150).required(),
  answer: Joi.string().min(3).required(),
  type: Joi.string()
    .valid('General', 'Order', 'Tracking', 'Payment', 'Return', 'Product')
    .optional(),
  productId: Joi.number().when('type', {
    is: 'Product',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const faqValidation = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.message, 400));
  } else {
    next();
  }
};
module.exports = faqValidation;
