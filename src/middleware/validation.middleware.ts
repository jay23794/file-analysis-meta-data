import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const dotenv = require("dotenv");
dotenv.config();

export const fetchUserValidate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const authHeader = request.headers.authorization;

    let token =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : "";

    if (!token) {
        response.status(401).json({ error: "No ID token provided" });
    }

    try {
        token = token ?? ""
        const secret = process.env.JWT_SECRET ?? ""
        var decoded = jwt.verify(token, secret);
        request.user = decoded;
        next();
    } catch (err) {
        response.status(401).json({
            error: err instanceof Error ? err.message : 'Authentication failed'
        });
    }

}