import joi from 'joi'


export const sendMessageSchema = joi.object({

    message: joi.string().min(10).max(500).required().messages({
        'string.min': "Message must be at least 10 characters",
        'string.max': "Message must be less than or equal to 500 characters",
    }),
    image: joi.string().uri().optional()

})