const jwt = require('jsonwebtoken');

// Utility functions to handle jwt authentication

// Generates a jwt token for the user
exports.getToken = function (username) {
    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign(
        { username: username },
        secretKey,
        { expiresIn: '6h'
    });

    return token;
}

// Verifies whether a jwt token is valid
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
        return null;
    }
}

// Middleware to ensure only authenticated users can continue with the request
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

// Middleware to check if request is from an authenticated user but does not block access to content
exports.checkForToken = (req, res, next) => {
    let token = req.cookies.token;
    const verified = this.verifyToken(token);

    if (verified) {
        req.username = verified.username; 
    }
    next();
}
