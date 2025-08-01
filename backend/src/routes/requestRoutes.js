import express from "express";
import { checkRequestHandler, submitRequestHandler } from "../controllers/requestController.js";

const router = express.Router();

router.post("/submit", submitRequestHandler)
router.post("/check", checkRequestHandler)

export default router