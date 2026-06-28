import { Router } from "express";
import { login, register } from "../controllers/userController.js";
import authenticate from "../../middleware/auth.js";
import { getUserHistory, addToUserHistory } from "../controllers/userController.js";

/* Router() is a factory function that returns a fresh router object with built-in
   HTTP methods (get, post, put, delete) to define routes for this specific resource   */

const router = Router();  // Creates an independent router instance to define and manage user-related routes

router.route("/login").post(login);
router.route("/register").post(register);

router.route("/activities")
  .get(authenticate, getUserHistory)
  .post(authenticate, addToUserHistory);

export default router;

