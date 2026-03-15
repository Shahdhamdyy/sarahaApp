import { EventEmitter } from 'events'
import { set } from '../../../database/redis.service.js'
import { generateHash } from '../../../common/hash/hash.js'
import { sendEmail } from './sendEmail.js'
import { env } from '../../../../config/index.js'

// Create an instance of EventEmitter
export const event = new EventEmitter()

event.on("verifyEmail", async (data) => {
    let { userId, email, userName } = data

    const code = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")

    await set({
        key: `otp::${userId}`,
        value: await generateHash(code),
        ttl: 5 * 60
    })

    await sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
        <h1>Welcome ${userName}</h1>
        <p>Your verification code is:</p>
        <h2>${code}</h2>
        <p>Or click the link below:</p>
        <a href="${env.BASE_URL}/verify-email?userId=${userId}&code=${code}">
        Verify Email
        </a>
        `
    })
})