var mysql = require('mysql');
var db = mysql.createConnection({
  host: '',
  user: '',
  password: '',
  database:  ''
});
db.connect();
module.exports = db;

/*
db.template.js는 버전관리 용으로 사용하고 db.js는 버전관리 시스템으로 사용하지 않음.
개발환경을 설정할 때 db.template.js 파일을 복사해서 db.js 파일을 만들고 db.js에 로그인 정보를 적어놓고 사용
*/
