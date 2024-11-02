const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authToken(req, res, next) {
    // console.log(req.headers)
    const token = req.headers['authorization']?.split(" ")[1];
    // console.log(token);
    if (token == null) {
        res.status(401).json({ msg: "Não existe Token" });
    } else {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                res.status(403).json({ msg: "Token inválido" });
            } else {
                res.locals.user = user;
                next();
            }
        })
    }
}

module.exports = authToken;