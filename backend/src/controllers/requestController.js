import { checkRequest, submitRequest } from "../services/requestServices.js";

export async function submitRequestHandler(req, res) {
    try {

        const {email, activity, genderPreference, facultyPreference, yearPreference, meetingDate, meetingHour} = req.body;

        const result = await submitRequest(email, activity, genderPreference, facultyPreference, yearPreference, meetingDate, meetingHour)
        if(result) {
            return res.json({message:"success"});
        } else {
            return res.json({message:"failed"});
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function checkRequestHandler (req, res) {
    try {
        
    } catch (error) {
        console.error(error);
        throw error;
    }
} 