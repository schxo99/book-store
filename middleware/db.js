const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1111",
    port: 3306,
    database: "bookstore1",
});

module.exports = pool;
