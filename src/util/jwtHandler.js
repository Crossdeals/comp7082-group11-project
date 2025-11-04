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

exports.verifyToken = function (username, token) {
    const secretKey = process.env.SECRET_KEY;

    try {
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
        console.log(error);
        return null;
    }
}

// exports.authenticateUser = (req, res, next) =>{
//     const username = req.body.username;
//     let token = req.headers.cookie;
//     token = token.split('=')[1];
//     const verified = verifyToken(username, token);

//     if (verified) {
//         req.user = decoded; 
//         next();
//     }
//     else {
//         res.status(403);
//         res.json({ message: "Token verification failed" });
//     }
// }
