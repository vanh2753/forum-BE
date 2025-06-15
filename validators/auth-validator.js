const Joi = require('joi');

const signupSchema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'Username không được để trống',
        'string.min': 'Username phải ít nhất 3 ký tự',
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email không được để trống',
        'string.email': 'Email không hợp lệ',
    }),
    password: Joi.string().max(128).required().messages({
        'string.empty': 'Password không được để trống'
    }),
    avatar_url: Joi.string().uri().optional().allow(''), // cho phép để trống
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email không được để trống',
        'string.email': 'Email không hợp lệ',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password không được để trống'
    })
})
module.exports = { signupSchema, loginSchema }