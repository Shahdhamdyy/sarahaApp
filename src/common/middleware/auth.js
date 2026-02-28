import jwt from 'jsonwebtoken'
import { env } from '../../../config/index.js'
import { decodeToken } from '../security/security.js'

export const auth = (req, res, next) => {
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
            req.userId = data.id
            next()
        default:
            break;

    }
}