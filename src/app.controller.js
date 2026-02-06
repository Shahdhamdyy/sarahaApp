import express from "express";
import { databaseConnection } from "./database/connection.js"
import { env } from "../config/env.service.js"


export const bootstrap = async () => {
    const app = express();
    app.use(express.json());
    await databaseConnection();
    app.use((error, req, res, next) => {
        res.status(500).json({ message: error.message });


    })
    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);

    })
}