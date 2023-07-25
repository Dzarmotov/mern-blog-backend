import express from "express";
import mongoose from "mongoose";
import multer from 'multer'
import cors from 'cors'

import { registerValidator, loginValidator, postCreateValidation } from "./validations.js";

import {handleValidationErrors, checkAuth} from "./utils/index.js";
import { UserController, PostController } from './controllers/index.js'


mongoose
  .connect("mongodb://127.0.0.1:27017/blog-mern")
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("Db err", err));

const app = express();


const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

//читает запросы формате json
app.use(express.json());
app.use(cors())

app.use('/uploads', express.static('uploads'))

// ============= Регистрация/Авторизация ==============

app.post('/auth/login', loginValidator, handleValidationErrors, UserController.login)
app.post("/auth/register", registerValidator, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe)

// =============== Posts ================
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})

app.get('/tags', PostController.getLastTags)

app.get('/posts', PostController.getAll)
app.get('/posts/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)

app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth,postCreateValidation, handleValidationErrors, PostController.update)


// ===========================

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server ok");
});
