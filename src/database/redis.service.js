import { client } from './redis.js'

export const createRevokeKey=({userId,token}) => {
    return `revokeToken:${req.userId}::${req.token}`
}

// Function to store a value in Redis
// key: the name of the key used to store the data
// value: the data we want to store
// ttl: time to live in seconds (after that the key will expire automatically)
export const set = async ({ key, value, ttl } = {}) => {

    // If the value is an object, convert it to string
    // because Redis stores data as strings
    if (value && typeof value === "object") {
        value = JSON.stringify(value)
    }

    // Store the value with expiration time
    return await client.set(key, value, {
        EX: ttl
    })
}


// Function to get a value from Redis using its key
export const get = async (key) => {

    // Get the value from Redis
    let value = await client.get(key)
    // If the value does not exist, return it as is (null)
    if (!value) return value

    try {
        // Try converting the string back to object
        value = JSON.parse(value)
    }
    catch (err) {
        // If it's not valid JSON, keep the value as it is
        // console.log("Value is not a valid JSON string:", err);
    }

    // Return the value
    return value
}


// Function to set or update the expiration time for a key
// This defines how long the key will stay in Redis
export const ttl = async (key, ttl) => {
    return await client.expire(key, ttl)
}


// Function to delete a specific key from Redis
export const del = async (key) => {
    return await client.del(key)
}


// Function to check if a key exists in Redis
// Returns 1 if the key exists, 0 if it does not
export const exists = async (key) => {
    return await client.exists(key)
}


// Function to delete all keys from Redis
// Usually used in development to clear cache
export const flushAll = async () => {
    return await client.flushAll()
}

// Get multiple values from Redis using multiple keys
export const mget = async (...keys) => {
    return await client.mget(...keys)
}

// Increment a numeric value in Redis
// Used for counters such as login attempts, request counting, or rate limiting
export const incr = async (key) => {
    return await client.incr(key)
}


// Set a value only if the key does not already exist
// Commonly used for OTP codes, locks, or preventing duplicate actions
export const setNX = async (key, value) => {
    return await client.setNX(key, value)
}


// Get all keys that match a specific pattern
// Mainly used for debugging or development to inspect stored keys
export const keys = async (pattern) => {
    return await client.keys(pattern)
}


// Get all keys that start with a specific prefix
// Used to retrieve related keys like user:*, otp:*, cache:*
export const prefixKeys = async (prefix) => {
    return await client.keys(`${prefix}*`)
} 