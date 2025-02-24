const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'sql110.infinityfree.com',
    user: 'if0_36920580',
    password: 'nN1jPe7lLKAq0Be',
    database: 'if0_36920580_elearning',
    port: '3306'
    
})

exports.db = pool.promise()