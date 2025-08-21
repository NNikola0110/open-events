import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';