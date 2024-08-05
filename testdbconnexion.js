const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'sql110.infinityfree.com',
    user: 'if0_36920580',
    password: 'nN1jPe7lLKAq0Be',
    database: 'if0_36920580_elearning',
    port: 3306
});

pool.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
        return console.error('error connecting: ' + error.stack);
    }
    console.log('The solution is: ', results[0].solution);
    pool.end();
});
