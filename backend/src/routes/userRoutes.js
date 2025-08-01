import express from "express";
import {checkIfEmailExistsHandler, registerHandler, loginHandler} from "../controllers/userController.js"

const router = express.Router();

router.get("/checkIfEmailExists", checkIfEmailExistsHandler);
router.post("/register", registerHandler);
router.post("/login", loginHandler);

export default router 