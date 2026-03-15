import { createClient } from "redis"
import { env } from '../../config/index.js'


export const client = createClient({
    // Redis connection 
    url: env.REDIS_URI
});

client.on("error", function (err) {
    throw err;
});
export const connectRedis = async () => {
    try {
        await client.connect();
        console.log("Connected to Redis");
    }
    catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
}