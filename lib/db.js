var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: 'nodejs',
  password: 'Tjsclq^*^',
  database: 'opentutorials'
});
db.connect();
module.exports = db;
