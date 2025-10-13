const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;


exports.getToken = function (username) {
    const token = jwt.sign(username, secretKey, {
        expiresIn: '6h'
    });

    return token;
}

exports.verifyToken = function (username, token) {
    try {
        token = token.split(' ')[1];
        const decoded = jwt.verify(token, secretKey);
        if (!decoded || !decoded.username || decoded.username !== username) {
            return null;
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return null;
        }
        return null;
    }
}
