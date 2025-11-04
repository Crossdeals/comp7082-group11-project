const jwt = require('jsonwebtoken');


exports.getToken = function (username) {
    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign(
        { username: username },
        secretKey,
        { expiresIn: '6h'
    });

    return token;
}

exports.verifyToken = function (token) {
    const secretKey = process.env.SECRET_KEY;

    try {
        const decoded = jwt.verify(token, secretKey);
        if (!decoded || !decoded.username) {
            return null;
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return null;
        }
        console.log(error);
        return null;
    }
}

exports.authenticateUser = (req, res, next) =>{
    let token = req.cookies.token;
    const verified = this.verifyToken(token);

    if (verified) {
        req.username = verified.username; 
        next();
    }
    else {
        res.status(403);
        res.json({ message: "Token verification failed" });
    }
}
