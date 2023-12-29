import { Router } from "express";
const router = Router();

//import all the controllers
import * as controller from "../controllers/appController.js";
import Auth from "../middleware/auth.js";

//POST methods
router.route("/register").post(controller.register);
// // router.route('/registerMail').post(); //send the registration email
// router.route('/authenticate').post((req,res)=>res.end()); //authenticate users
router.route("/login").post(controller.verifyUser, controller.login); //login user in the application

// //GET methods
router.route("/user/:username").get(controller.getUser); //user with username
// router.route('/generateOTP').get(controller.generateOTP);//generate random otp
// router.route('/verifyOTP').get(controller.verifyOTP);//verify random otp
// router.route('/createResetSession').get(controller.createResetSession);//reset all the variables

// //PUT methods
router.route('/updateuser').put(Auth, controller.updateUser);//is use to update user profile
// router.route('/resetPassword').put(controller.resetPassword);//use to reset password

export default router;
