const { User } = require('../model/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');

router.post('/', async(req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email, confirmed: true });
    if(!user) return res.status(400).send('Invalid email or password');

    const password = await bcrypt.compare(req.body.password, user.password);
    if(!password) return res.status(400).send('Invalid email or password');

    const token = user.generateAuthToken();
    res.send(token);
});

function validate(user){
    const schema = {
        password: Joi.string().min(6).max(16).required(),
        email: Joi.string().email().required()
    }
    return Joi.validate(user, schema);
}

module.exports = router;