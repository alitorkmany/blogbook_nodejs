const { User, validate, validateUpdate } = require('../model/user');
const mail = require('../transporter');
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const Fawn = require('fawn');
const jwt = require('jsonwebtoken');
const config = require('config');

Fawn.init(mongoose);

const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './uploads/profile/');
    },
    filename: function(req, file, callback){
        callback(null, new Date().toISOString() + file.originalname);
    }
});

const upload = multer({storage: storage} );

router.post("/", upload.single('profileImage'), asyncMiddleware(async(req, res) => {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("user already exits");

    //Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(req.body.password, salt);

    user = new User({
        profileImage: req.file ? req.file.path : null,
        name: req.body.name,
        password: hashed,
        email: req.body.email,
        confirmed: false
    });


    user = await user.save();

    const token = user.generateAuthToken();

    const url = `http://localhost:3000/api/user/confirm/${token}`;

    mail(req.body.email, url);

    res.send("Please check your email for completing registeration.");
    // res.header('x-auth-token', token).send({
    //     profileImage: user.profileImage,
    //     user: user.name,
    //     email: user.email
    // });
}));

router.get('/confirm/:token', asyncMiddleware(async(req, res) => {
    const token = req.params.token;
    if(!token) return res.status(400).send('Invalid link');

    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    let user = await User.findById(decoded);
    if (!user) return res.status(400).send("Invalid user id");

    user.confirmed = true;

    user = await user.save();

    res.send('user activated');
}));

router.get('/me', auth, asyncMiddleware(async(req, res) => {
    const user = await User.findById(req.user);
    res.send(user);
}));

router.put('/me', auth, upload.single('profileImage'), asyncMiddleware(async(req, res) => {
    const {error} = validateUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findById(req.user);
    if (!user) return res.status(400).send("Invalid user id");

    user.set({
        profileImage: req.file ? req.file.path : user.profileImage,
        name: req.body.name,
        email: req.body.email
    });

    user = await user.save();

    res.send({
        profileImage: user.profileImage,
        user: user.name,
        email: user.email
    });
}));

router.delete('/me', auth, asyncMiddleware(async(req, res) => {
    let user = await User.findById(req.user);
    if (!user) return res.status(400).send("Invalid user id");

    new Fawn.Task()
        .remove('users', { _id: req.user })
        .remove('posts', { author: req.user })
        .run({ useMongoose: true });
        res.send('Your acount has been removed');
  
}));

module.exports = router;