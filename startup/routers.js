const express = require('express')
const userRouter = require("../routes/user");
const login = require('../routes/login');
const post = require('../routes/post');
const error = require('../middleware/error');

module.exports = function(app){
    app.use('/uploads/profile', express.static('uploads/profile'));
    app.use(express.json());
    app.use('/api/user', userRouter);
    app.use('/api/login', login);
    app.use('/api/post', post);

    app.use(error);
}

