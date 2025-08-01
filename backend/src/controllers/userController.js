import { checkIfEmailExists, register } from "../services/userServices.js";

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
        res.status(500).json({error:"Server error"});
    }
}

export async function registerHandler (req,res) {
    try {
        const {email, password, gender, faculty, year} = req.body;
        const success = await register(email, password, gender, faculty, year);

        if(success) {
            res.status(201).json({message: "User created."});
        } else {
            res.status(400).json({message: "Failed."});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Server error"});
    }
}