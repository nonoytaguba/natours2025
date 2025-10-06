const express =require('express');
const multer = require('multer'); //lesson 199, 1:51
const userController = require('./../controllers/userController.js');
const authController = require('./../controllers/authController.js');

// const upload = multer({dest: 'public/img/users'}); //lesson 199


const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


// Protect all routes after this middleware
router.use(authController.protect);

router.patch(
    '/updateMyPassword',
     authController.updatePassword) //11:11 lesson 138

router.get(
    '/me',
    userController.getMe,
    userController.getUser
);

router.patch('/updateMe',
     userController.uploadUserPhoto,
     userController.resizeUserPhoto,
     userController.updateMe); //lesson 199 , 5:01 , photo is the name of the field
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)

router.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports = router




