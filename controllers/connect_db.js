const mysql_connection_object = {
    connectionLimit:10,
    host: 'localhost',
    user:'root',
    database: 'MovieLensDatabase',
    password: 'newrootpassword'
};

var mysql = require('mysql');
var util = require('util');

const pool = mysql.createPool(mysql_connection_object);
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
})
pool.query = util.promisify(pool.query);
module.exports = pool