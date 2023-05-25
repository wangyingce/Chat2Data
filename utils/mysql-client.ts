import mysql from 'mysql2/promise';
import {PINECONE_NAME_SPACE } from '@/config/pinecone';

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Walter4170',
    database: 'mysql'
});

export async function insertNamespace() {
    // Create a connection to the database
    const [result] = await connection.execute(
        'INSERT INTO vecdbns (ns) VALUES (?)',
        [PINECONE_NAME_SPACE]
    );
    console.log(result);
    // It's a good practice to close the database connection when you're done with it
    await connection.end();
    return result;
}

export async function queryNamespace() {
    const [rows] = await connection.execute('SELECT ns FROM vecdbns');
    console.log(rows);
    // await connection.end();
    return rows;
}