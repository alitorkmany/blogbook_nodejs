const auth = require('../middleware/auth');
const { Post, validatepost, validatecomment, validateobjectId } = require('../model/post');
const asyncMiddleware = require('../middleware/async');
const express = require('express');
const router = express.Router();

router.get('/', auth, asyncMiddleware(async(req, res) => {
    const posts = await Post
        .find()
        .limit(10)
        .sort({ date: -1 })
        .populate('author', ['profileImage', 'name'])
        .populate('comments.user', ['profileImage', 'name']);
    res.send(posts);
}));

router.post('/', auth, asyncMiddleware(async(req, res) => {
    const { error } = validatepost(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let post = new Post({
        author: req.user,
        body: req.body.body
    });

    post = await post.save()
    post = await post.populate('author', ['profileImage', 'name']).execPopulate();
    res.send(post);
}));

router.put('/:id', auth, asyncMiddleware(async(req, res) => {
    const { error: err } = validateobjectId({postId: req.params.id});
    if(err) return res.status(400).send(err.details[0].message);

    const { error } = validatepost(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let post = await Post.findOne({ _id: req.params.id, author: req.user });
    if(!post) return res.status(400).send('Access denied, you can´t edit this post');

    post.set({
        body: req.body.body
    });

    post = await post.save();
    res.send(post);
}));

router.delete('/:id', auth, asyncMiddleware(async(req, res) =>{
    const { error } = validateobjectId({postId: req.params.id});
    if(error) return res.status(400).send(error.details[0].message);

    const post = await Post.deleteOne({ _id: req.params.id, author: req.user });
    if(post.deletedCount === 0) return res.status(401).send('Operation failed')
    if(post.deletedCount === 1) return res.send('Post deleted successfully')
}));

//******************** comment route ***********************/
router.post('/comment', auth, asyncMiddleware(async(req, res) => {
    const { error } = validatecomment(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const postId = req.body.postId;
    let post = await Post.findById(postId);
    
    if(!post) return res.status(400).send('Invalid post id.')

    let comment = await post.comments.create({
        user: req.user,
        comment: req.body.comment
    });
    
    post.comments.push(comment)
    post = await post.save();

    res.send(comment);
}));

router.delete('/comment/:id', auth, asyncMiddleware(async(req, res) => {
    const { error } = validateobjectId({postId: req.params.id});
    if(error) return res.status(400).send(error.details[0].message);

    let post = await Post.findOne({"comments._id": req.params.id, "comments.user": req.user});
    if(!post) return res.status(400).send('access denied');

    const comment = post.comments.id(req.params.id);
    comment.remove();
    post.save();
    res.send(post);
}));

//******************** like route ***********************/
router.post('/like', auth, asyncMiddleware(async(req, res) => {
    const { error } = validateobjectId(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const postId = req.body.postId;
    let post = await Post.findById(postId);
    console.log(post.likes)
     
    if(!post) return res.status(400).send('Invalid post id.')

    const liked = post.likes.find(Isliked => Isliked.user == req.user._id);
    
    if(liked){
        liked.remove();
        post.save();
        return res.send('Like removed');
    }else{
        post.likes.push({
        user: req.user,
        like: true
        });
        post.save();
        return res.send('like added');
    }

}));


module.exports = router;

