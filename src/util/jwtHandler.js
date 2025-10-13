const jwt = require('jsonwebtoken');


exports.getToken = function (username) {
    let secretKey = process.env.SECRET_KEY;
    console.log(secretKey);
    const token = jwt.sign(
        { username: username },
        secretKey,
        { expiresIn: '6h'
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
