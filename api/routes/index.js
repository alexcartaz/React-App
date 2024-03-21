const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Course = require('../models').Course;
const { authenticateUser } = require('../authentication/auth-user')

// wrapper for all async calls to simplify code
function asyncHandler(cb){
    return async (req, res, next)=>{
        try {
            await cb(req, res, next)
        } catch (err) {
            next(err);
        }
    };
};


// ---------- Users Routes ------------

// GET data for currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const {id, firstName, lastName, emailAddress} = req.currentUser
    
    // fiter out password, createdAt, updatedAt from the response
    res.status(200).json({id, firstName, lastName, emailAddress});
}));

// POST to CREATE a new user
router.post('/users', asyncHandler(async (req, res) => {
    try {
        await User.create(req.body);  
        // On success, set header to home/root
        res.status(201).setHeader('Location', '/').end()
    } catch (error) {
        //this error catch repeats, consider abstracting
        console.log('Error: ', error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            // validation errors can be > 1 for any given db object so we grab all
            const errors = error.errors.map(err => err.message);
            res.status(400).json({errors});
        } else {
            throw error;
        }
    }
    
}));


// ---------- Courses Routes ------------

// GET list of all courses
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'emailAddress']
            }
        ]
    });
    res.status(200).json(courses);
}));

// GET individual course
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'emailAddress']
            }
        ]
    });
    if (course) {
        res.status(200).json(course);
    } else {
        console.log('Error: ', error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({errors});
        } else {
            throw error;
        }
    }
}));

// POST to CREATE a new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const newCourse = await Course.create(req.body);
        // On success, set header to course id page
        res.status(201).setHeader('Location', `/courses/${newCourse.id}`).end()
    } catch (error) {
        console.log('Error: ', error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({errors});
        } else {
            throw error;
        }
    }    
}));

// PUT to UPDATE a specific course
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    try {
        let course = await Course.findByPk(req.params.id)
        if (course) {
            // current user
            const user = req.currentUser; 
            // course owner
            const courseOwner = course.dataValues.userId;
            const authenticatedUserId = user.dataValues.id;
            // validate auth
            if (courseOwner === authenticatedUserId){
                await course.update(req.body);
                res.status(204).end();
            } else {
                res.status(403).json({message: "Access denied."});
            }
        } else {
            res.status(400).json({message: "Course not found"});
        }        
    } catch (error) {
        console.log('Error: ', error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({errors});
        } else {
            throw error;
        }
    }
}));

// DELETE an individual course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    try {
        let course = await Course.findByPk(req.params.id)
        if (course) {
            // current user
            const user = req.currentUser; 
            // course owner
            const courseOwner = course.dataValues.userId;
            const authenticatedUserId = user.dataValues.id;
            // validate auth
            if (courseOwner === authenticatedUserId){
                await course.destroy();
                res.status(204).end();           
            } else {
                res.status(403).json({message: "Access denied."});
            }
        } else {
            res.status(400).json({message: "Course not found"});
        }
    } catch (error) {
        console.log('Error: ', error);
    }
}));

module.exports = router;