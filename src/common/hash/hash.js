import { hash, compare } from 'bcrypt'
import { env } from '../../../config/env.service.js';

export const generateHash = async (password) => {
    return await hash(password, + env.salt)
}
export const compareHash = async (password, hash) => {
    return await compare(password, hash)
}
