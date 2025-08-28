import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export function generateToken(user:{user_id: String, username: string}){
    return jwt.sign(
        {user_id: user.user_id, username: user.username},
        JWT_SECRET,
        {expiresIn: '24h'}
    );
}

export function verifyToken (token: string){
    try{
        return jwt.verify(token, JWT_SECRET) as { user_id: string; username: string };
    }catch{
        return null;
    }
}