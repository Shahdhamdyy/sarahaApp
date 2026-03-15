import jwt from 'jsonwebtoken'
import { env } from '../../../config/index.js'
import { decodeToken } from '../security/security.js'
import { get } from '../../database/redis.service.js'
import { UnauthorizedException } from '../utils/response/index.js'
export const auth = async (req, res, next) => {
    let { authorization } = req.headers

    const [flag, token] = authorization.split(" ")



    switch (flag) {
        case "Basic":
            let Basicdata = Buffer.from(token, 'base64').toString('utf-8')

            let [email, password] = Basicdata.split(":")
            break;
        case "Bearer":
            if (!authorization) {
                UnauthorizedException({ message: "Unauthorized" })
            }
            let data = decodeToken(token)
            let revokedToken = await get(
                createRevokeKey({
                    userId: data.id,
                    token

                })
            )
            if (revokedToken) {
                UnauthorizedException({ message: "already Logged out" })
            }
            req.userId = data.id
            req.token = token
            req.decoded = data
            next()
        default:
            break;

    }
}