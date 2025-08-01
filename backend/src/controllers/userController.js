import { checkIfEmailExists, getUserFromEmail, register } from "../services/userServices.js";
import bcrypt from "bcrypt";
import util from "util";

export async function checkIfEmailExistsHandler (req,res) {
    try {
        const {email} = req.query;
        const result = await checkIfEmailExists(email);
        if (result.length > 0) {
            return res.json({ exists: true });  
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        res.json({error:"Server error"});
    }
}

export async function registerHandler (req,res) {
    try {
        const {email, password, gender, faculty, yearOfStudy, firstName, lastName} = req.body;
        const display = firstName + " " + lastName;
        const success = await register(email, password, gender, faculty, yearOfStudy, display);

        if(success) {
            res.json({message: "success"});
        } else {
            res.json({message: "failed"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error});
    }
}

export async function loginHandler (req,res) {
    try {
        const {email, password} = req.body;
        const emailExists = await checkIfEmailExists(email);
        if(emailExists.length === 0) {
            return res.json({message: "Email is not registered, please register."})
        }

        const userData = await getUserFromEmail(email);
        const hashedPassword = userData[0].password;
        const bcrypt_compare = util.promisify(bcrypt.compare);
        const result = await bcrypt_compare(password, hashedPassword);
        if(result) {
            res.json({message: "success"});
        } else {
            res.json({message: "password mismatch"});
        }
    } catch (error) {
        console.error(error);
        res.json({error: error})
    }
}