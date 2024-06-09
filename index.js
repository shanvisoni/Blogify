require('dotenv').config()
const path=require("path");
const express=require("express");
const mongoose = require('mongoose');
const Blog = require('./models/blog')
cookieParser=require('cookie-parser');
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');

const PORT=3001;
const app=express();


mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
.then((e)=> console.log("MongoDB Connected"));

app.use(express.static(path.resolve('./public')))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.set('view engine',"ejs");
app.set('views',path.resolve('./views'));



app.get('/', async (req,res)=>{
    const allBlogs = await Blog.find({});
    console.log(Blog.find())
    res.render("home",{
        user: req.user,
        blogs:allBlogs,
    });
});

app.use('/user',userRoute)
app.use('/blog',blogRoute)

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
  })