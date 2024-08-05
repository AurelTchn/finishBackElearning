const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'https://php-myadmin.net/db_structure.php?db=if0_36920580_elearning',
    user: 'root',
    password: '',
    database: 'elearning'
    
})

exports.db = pool.promise()