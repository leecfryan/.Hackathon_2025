import express from "express";
import {checkIfEmailExistsHandler, registerHandler} from "../controllers/userController.js"

const router = express.Router();

router.get("/checkIfEmailExists", checkIfEmailExistsHandler)
router.post("/register", registerHandler)

export default router 