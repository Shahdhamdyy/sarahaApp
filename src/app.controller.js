import express from "express";
import { databaseConnection } from "./database/index.js"
import { env } from "../config/env.service.js"
import { globalErrorHandler } from "./common/utils/response/index.js"
import authRouter from "./modules/auth/auth.controller.js"

export const bootstrap = async () => {
    const app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
    await databaseConnection();
    app.use('{*dummy}', (req, res) => res.status(404).json('invalid route'))
    app.use(globalErrorHandler);

    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);

    })
}