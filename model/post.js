const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

//*****************Comment Schema *********************
const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true
    },
    comment: { type: String, require: true },
    date: { type: Date, default: Date.now }
});

//***************** Like Schemma  ******************************/
const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true
    },
    like: { type: Boolean }
});


const Post = mongoose.model('post', new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true
    },
    body: { type: String, require: true },
    comments: [commentSchema],
    likes: [likeSchema],
    date: { type: Date, default: Date.now }
}));

//*********************** Joi validations **************************/
function validatepost(post){
    const schema = {
        body: Joi.string().min(1).required()
    }
    return Joi.validate(post, schema);
}

function validatecomment(comment){
    const schema = {
        postId: Joi.objectId().required(),
        comment: Joi.string().min(1).required()
    }
    return Joi.validate(comment, schema);
}

function validateobjectId(objectId){
    const schema = {
        postId: Joi.objectId().required(),
    }
    return Joi.validate(objectId, schema);
}


exports.Post = Post;
exports.validatepost = validatepost;
exports.validatecomment = validatecomment;
exports.validateobjectId = validateobjectId;