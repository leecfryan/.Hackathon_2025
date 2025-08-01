import pool from "../config/db.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

export async function login(email, password) {
    try {
        const query = ``;

        const values = [];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function register(email, password, gender, faculty, year) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password,salt);
        const query = `insert into users (email, password, gender, faculty, year_of_enroll)
            values ($1, $2, $3, $4, $5)`;
        const values = [email, hashedPassword, gender, faculty, year];
        const result = await pool.query(query, values);
        return result.rowCount > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function checkIfEmailExists(email) {
    try {
        const query = `select from users where email = $1`;
        const values = [email];
        const result = await pool.query(query, values);
        return result.rowCount > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}