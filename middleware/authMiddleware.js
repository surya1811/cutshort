const User = require("../models/user");
require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.authenticateUser = (req, res, next) => {
    const token = req.body.token
    const userId = req.user._id;
    jwt.decode(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err) {
            res.status(400).json({ error: err })
        }
        if (decode.userId == userId || decode.role == 'admin') {
            next()
        }
        else {
            return res.status(401).json({ message: "unAuthorized" })
        }
    })

}