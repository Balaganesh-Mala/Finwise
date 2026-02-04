const jwt = require('jsonwebtoken');
const Trainer = require('../models/Trainer');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await Trainer.findById(decoded.id).select('-password');
            if (!req.user) {
                 return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Status Check: Block access if rejected or on hold
            if (req.user.status === 'rejected' || req.user.status === 'hold') {
                return res.status(403).json({ message: 'Access denied. Account is deactivated.' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

exports.admin = (req, res, next) => {
    // Assuming Admin has a role or a separate Admin model check. 
    // For now, if we use Trainer model for admins too or just check role
    // This is placeholder logic, adjust if Admin is separate collection
    if (req.user && req.user.role === 'Admin') { 
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as admin' });
    }
};
