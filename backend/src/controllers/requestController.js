import { checkRequest, submitRequest } from "../services/requestServices.js";

export async function submitRequestHandler(req, res) {
    try {
        const {email, activity, genderPreference, facultyPreference, yearPreference, meetingDate, meetingHour} = req.body;
        const result = await submitRequest(email, activity, genderPreference, facultyPreference, yearPreference, meetingDate, meetingHour)
        if(result.message === "success") {
            return res.json({message:"success", requestId: result.requestId});
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
        const {email, requestId} = req.body;
        const result = await checkRequest(email, requestId);
        return res.json(result);
    } catch (error) {
        console.error(error);
        throw error;
    }
} 