"use strict";
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    class User extends Model {}
    User.init({
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A first name is required'
                },
                notEmpty: {
                    msg: 'Please provide a first name'
                },
            },
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A last name is required'
                },
                notEmpty: {
                    msg: 'Please provide a last name'
                },
            },
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            // will ensure that each entry is unique
            unique: {
                msg: 'The email you entered already exists'
            },
            validate: {
                notNull: {
                    msg: 'An email is required'
                },
                isEmail: {
                    msg: 'Please provide a valid email address'
                },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            // Defining a custom setter for the model with the set() method
            // set() receives the value, val, to set the password field
            set(val){
                // hash the password with bcrypt.hashSync()
                const hashedPassword = bcrypt.hashSync(val, 10);
                // setDataValue() is a Sequelize method used inside setters to update the underlying data value
                this.setDataValue('password', hashedPassword);
            },
            validate: {
                notNull: {
                    msg: 'A password is required'
                },
                notEmpty: {
                    msg: 'Please provide a password'
                },
            },
        },
    }, { sequelize });
    
    User.associate = (models) => {
        // Tells Sequelize that a user can be associated with one or more courses
        User.hasMany(models.Course, {
            foreignKey: {
                fieldName: 'userId',
                allowNull: false,
            },
        });
    };
    
    
    return User;
};