import pool from "../config/db.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

export async function getUserFromEmail(email) {
    try {
        const query = `select * from users where email = $1`;
        const values = [email];
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function register(email, password, gender, faculty, year, display, firstName, lastName) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password,salt);
        const query = `insert into users (email, password, gender, faculty, year_of_study, display_name, first_name, last_name)
            values ($1, $2, $3, $4, $5, $6, $7, $8)`;
        const values = [email, hashedPassword, gender, faculty, year, display, firstName, lastName];
        const result = await pool.query(query, values);
        return result.rowCount > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function checkIfEmailExists(email) {
    try {
        const query = `select * from users where email = $1`;
        const values = [email];
        const result = await pool.query(query, values);
        return result.rowCount > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}