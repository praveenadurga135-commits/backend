const jwt = require("jsonwebtoken");

const makeToken = async (user) => {
    return jwt.sign(
            {id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES || "1d"}
        );
}

module.exports={ makeToken };