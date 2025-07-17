import jwt from "jsonwebtoken";
import User from "../database/user.js";

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.KEY);

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            req.user = user;
            next(); 
        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({ message: "Not authorized, token failed or expired" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

/*
export const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Token not found : failed authentication" });
        const decoded = jwt.verify(token, process.env.KEY);

        const email = await User.findOne({ email: decoded.email });

        if (!email || email.role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }
        req.user = email;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
*/

export const authorization = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Authorization failed: You do not have permission to access this resource." });
    }
    next();
};
