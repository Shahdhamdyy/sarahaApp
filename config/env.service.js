import dotenv from 'dotenv';
dotenv.config({ path: "./config/.env" });

const mongoURL = process.env.MONGO_URI;
const mood = process.env.MOOD;
const port = process.env.PORT;
const salt = process.env.SALT

export const env = {
    mongoURL,
    mood,
    port,
    salt

}