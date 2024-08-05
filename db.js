const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'elearning',
    port : "5506"
    
})

exports.db = pool.promise()