import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();


export default async function Connection() {
    const conn = mysql.createConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE
    });

    return conn;
}