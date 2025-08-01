import pool from "../config/db.js";
import { getUserFromEmail } from "./userServices.js";
import { getUserFromId } from "./userServices.js";

export async function submitRequest (email, activity, genderPref, facultyPref, yearPref, meetingDate, meetingHour) {
    try {
        const user = await getUserFromEmail(email)
        const user_id = user[0].user_id;

        const query = `insert into requests (user_id, activity_type, preferred_gender, preferred_faculty, preferred_year, meeting_date, meeting_hour)
                     values ($1, $2, $3, $4, $5, $6, $7)
                     returning request_id`;
        const values = [user_id, activity, genderPref, facultyPref, yearPref, meetingDate, meetingHour]
        const result = await pool.query(query, values);
        if(result.rows.length > 0) {
            return {
                message: "success",
                requestId: result.rows[0].request_id
            }
        } else {
            return {message: "failed"}
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function checkRequest (email, reqId, activity, genderPref, facutlyPref, yearPref, status) {
    try {
        const user = await getUserFromEmail(email);
        const userData1 = user[0];
        const userId1 = userData1.user_id;
        const userGender1 = userData1.gender;
        const userFaculty1 = userData1.faculty;
        const userYear1 = userData1.year_of_study

        const request = await getRequestbyId(reqId)
        const meetingDate = request[0].meeting_date;
        const meetingHour = request[0].meeting_hour;
        const activity = request[0].activity_type  
        const genderPref = request[0].preferred_gender;
        const facultyPref = request[0].preferred_faculty;
        const yearPref = request[0].preferred_year;

        //This settles meeting date and activity
        const {rows: pending} = await pool.query(
            `select * from requests where status = 'pending' and meeting_date = $1 and user_id != $2 and activity_type = $3 and meeting_hour = $4`,
             [meetingDate, userId1, activity, meetingHour]
        )

        for(const req of pending ) {
            const userId2 = req.user_id;
            const reqId2 = req.request_id;
            const user2 = await getUserFromId(userId2)
            const userData2 = user2[0];
            const userGender2 = userData2.gender;
            const userFaculty2 = userData2.faculty;
            const userYear2 = userData2.year_of_study;

            const genderPref2 = req.preferred_gender;
            const facultyPref2 = req.preferred_faculty;
            const yearPref2 = req.preferred_year;

            const genderOk = ((genderPref === "any" || genderPref === userGender2) && (genderPref2 === "any" || genderPref2 === userGender1))
            const facultyOk = ((facultyPref === "any" || facultyPref === userFaculty2) && (facultyPref2 === "any" || facultyPref2 === userFaculty1))
            const yearOk = ((yearPref === "any" || yearPref === userYear2) && (yearPref2 === "any" || yearPref2 === userYear1))

            if(genderOk && facultyOk && yearOk) {
                await pool.query("update requests set status = 'matched' where request_id = $1", [reqId2]);
                await pool.query("update requests set status = 'matched' where request_id = $1", [reqId]);
            }

            console.log(genderOk, facultyOk, yearOk)

            if(genderOk && facultyOk && yearOk) {
                return 2
            }
        }
        return 1

    } catch (error) {
        console.error(error);
        throw error;
    }
} 

export async function getRequestbyId (reqId) {
    try {
        const query = `select * from requests where request_id = $1`;
        const values = [reqId];
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw error;
    }
} 