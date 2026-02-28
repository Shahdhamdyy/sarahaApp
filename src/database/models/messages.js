import mongoose, { Types } from 'mongoose';


const messageSchema = new mongoose.Schema({
    message: { type: String, required: true, minlength: 10, maxlength: 500 },
    receiverId: { type: Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    image: { type: String },
    timestamp: { type: Date, default: Date.now }

},
    {
        timestamps: true
    }

);

export const messageModel = mongoose.model('Message', messageSchema);

