const Joi = require('joi');

module.exports.categorySchema = Joi.object({
    category: Joi.object({
        title: Joi.string().required(),
        title: Joi.any()
    }).required()
});