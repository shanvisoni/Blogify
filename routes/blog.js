const { Router } =require('express');
const multer = require('multer');
const path = require('path');
const Blog =require('../models/blog')
const Comment = require('../models/comment')
const { checkForAuthenticationCookie } = require('../middlewares/authentication');

const router= Router();


const storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null, path.resolve(`./public/uploads/`))
    },
    filename: function(req,file,cb) {
        const fileName=`${Date.now()}-${file.originalname}`;
        cb(null,fileName);
    },
});
const upload = multer({storage: storage})
router.get("/add-new", (req,res) =>{
    return res.render('addBlog',{
        user:req.user,
    }) 
})



router.post('/comment/:blogId',async(req,res)=>{
 await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
})
return res.redirect(`/blog/${req.params.blogId}`);
})

router.get('/:id',async (req,res) => {
    const blog = await Blog.findById(req.params.id).populate('createdBy')
    // console.log('blog',blog);
    const comments = await Comment.find({blogId: req.params.id}).populate('createdBy');

    console.log("comments", comments);

    return res.render("blog",{
        user: req.user,
        blog,
        comments,
    })
})



router.post('/', upload.single("CoverImage"), async (req,res)=>{
    // console.log(req.body);
    // console.log(req.file);
    const { title, body } = req.body;
    const blog =await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
});



// Handle blog post deletion
router.delete('/:id', checkForAuthenticationCookie('token'), async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user._id;

    try {
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        if (blog.createdBy.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'You are not authorized to delete this blog post' });
        }

        await Blog.findByIdAndDelete(blogId);
        res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete the blog post' });
    }
});


module.exports = router;