'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

exports.authenticateUser = async (req, res, next) => {
    let message;
    // Credentials from authorization header should be set to an object with the user's key and secret
    const credentials = auth(req);
    if (credentials) {
        // db rules enforce unique emails; use this to find credentialed user
        const user = await User.findOne({ where: { emailAddress: credentials.name }});
        if (user) {
            // compareSync() hashes the user's pw and compares it to the stored hash to determine if auth'd
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.password);
            if (authenticated) {
                console.log(`Authentication successful for user email: ${user.emailAddress}`);
                // Store the user on the Request object by adding currentUser property on the req object
                req.currentUser = user;
            } else {
                message = `Authentication failure for user email: ${user.emailAddress}`;
            }
        } else {
            message = `User not found with email: ${credentials.name}`;
        }
     } else {
        message = `Auth header not found`;
     }

    // If user authentication failed... 
    if (message) {
        console.warn(message);
        // Error message is intentionally vague as to NOT help potential hackers
        res.status(401).json({ message: 'Access Denied' });
    } else {
        next();
    }
};