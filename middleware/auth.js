const jwt = require("jsonwebtoken");
const Admin = require("../model/adminModel");

require("dotenv").config();

module.exports = {
    generateToken: (id, role) => {
        const token = jwt.sign({ id, role }, process.env.JWTSECRET);
    
        return token;
    },

    verifyTokenAdmin: async (req, res, next) => {
        try {
            let token = req.headers["authorization"];
            if (!token) {
                return res.status(403).json({ errMsg: "Access denied" });
            }
            if (token.startsWith("Bearer")) {
                token = token.slice(7, token.length).trimLeft();
            }
            const verified = jwt.verify(token, process.env.JWTSECRET);
            req.payload = verified;
    
            if (req.payload.role === "admin") {
                next();
            } else {
                return res.status(403).json({ errMsg: "Access Denied" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ errMsg: "Server Down" });
        }
    },

    verifyTokenEmployee: async (req, res, next) => {
        try {
            let token = req.headers["authorization"];
            if (!token) {
                return res.status(403).json({ errMsg: "Access denied" });
            }
            if (token.startsWith("Bearer")) {
                token = token.slice(7, token.length).trimLeft();
            }
            const verified = jwt.verify(token, process.env.JWTSECRET);
            req.payload = verified;
    
            if (req.payload.role === "employee") {
                next();
            } else {
                return res.status(403).json({ errMsg: "Access Denied" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ errMsg: "Server Down" });
        }
    },
}
