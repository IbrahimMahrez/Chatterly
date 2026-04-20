

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
const token = req.headers.authorization?.split(' ')[1] || req.header('x-auth-token'); // Check for token in Authorization header or x-auth-token header
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

//verify token and authorize

function verifyTokenAndAuthorization(req, res, next) {
    verifyToken(req, res, () => {
        const isOwner = req.user._id.toString() === req.params.id;
        const isAdmin = req.user.isAdmin;

        if (isOwner || isAdmin){
            next();
        } else {
            return res.status(403).json({ message: 'Not allowed to perform this action' });
        }
    });
}
//verify token and admin
function verifyTokenAndAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied. You are not an admin.' });
        }
    });
}



module.exports ={ verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin };