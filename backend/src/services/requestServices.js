import pool from "../config/db.js";
import { getUserFromEmail } from "./userServices.js";

function isCompatible(r1, r2) {
    const genderOk = r1.pGender === "both" || r2.pGender === "both" 
}


export async function submitRequest (user_id, activity, pGender, pFaculty, pYear, meetingDate, status) {
    try {

    } catch (error) {
        console.error(error);
        throw error;
    }
}