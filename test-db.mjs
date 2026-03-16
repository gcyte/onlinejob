import * as mariadb from 'mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

async function test(url, label) {
    console.log(`--- Testing ${label} ---`);
    console.log('URL:', url);
    let conn;
    try {
        conn = await mariadb.createConnection(url);
        console.log(`SUCCESS: Connected to ${label}`);
        const rows = await conn.query("SHOW DATABASES");
        console.log("Databases found:", rows.map(r => r.Database).join(", "));
        await conn.end();
        return true;
    } catch (err) {
        console.error(`FAILED: ${label}`, err.message);
        return false;
    }
}

async function runTests() {
    const envUrl = process.env.DATABASE_URL;
    const noPassUrl = envUrl.replace(":password@", "@");

    await test(envUrl, "Current .env URL");
    await test(noPassUrl, "No password URL");
}

runTests();
