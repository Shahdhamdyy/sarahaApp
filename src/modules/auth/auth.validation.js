import joi from 'joi'


export const signUpSchema = joi.object({
    userName: joi.string().min(3).max(20).required(),
    age: joi.number().min(18).max(100).required().messages({
        'number.min': "Age must be at least 18",
        'number.max': "Age must be less than or equal to 100",
    }),
    email: joi.string().email().required(),
    password: joi.string().min(6).max(20).required(),
    // password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(6).max(20).required(),
    // users: joi.array().items(joi.string()).min(1).max(5).required().messages({
    //     'array.min': "At least one user must be selected",
    //     'array.max': "No more than 5 users can be selected",
    // }),
})
export const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).max(20).required(),

})
