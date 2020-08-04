const mongoose = require('mongoose');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');


userSchema = new mongoose.Schema({
    profileImage: {type: String },
    name: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    email: { type: String },
    confirmed: { type: Boolean}
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model('user', userSchema);

function validateUser(user){
    const schema = {
        name: joi.string().min(3).max(20).required(),
        password: joi.string().min(6).max(16).required(),
        email: joi.string().email().required()
    }
    return joi.validate(user, schema);
}

function validateUserUpdate(user){
    const schema = {
        name: joi.string().min(3).max(20).required(),
        email: joi.string().email().required()
    }
    return joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
exports.validateUpdate = validateUserUpdate;