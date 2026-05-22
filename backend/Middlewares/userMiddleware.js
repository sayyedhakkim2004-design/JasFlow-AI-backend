import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Token Not Found" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode.id;
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

export const verifyPasswordToken = async (req, res, next) => {
    try {
        const token = req.cookies?.passwordToken;
        if (!token) {
            return res.status(401).json({ success: false, message: "Token Not Found" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode.id;
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}