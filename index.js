const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000; // Render가 자동으로 지정하는 포트를 사용해야 함

// DB 연결 설정
const db_config = {
  host: 'my8003.gabiadb.com',
  user: 'tm0409',
  password: 'david767929',
  database: 'taemindb'
};

let db;
function handleDisconnect() {
  db = mysql.createConnection(db_config);

  db.connect(err => {
    if (err) {
      console.error('MySQL 연결 실패:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('MySQL 연결 성공');
    }
  });

  db.on('error', err => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.warn('MySQL 연결 끊김. 재연결 중...');
      handleDisconnect();
    } else {
      throw err;
    }
  });
}
handleDisconnect();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/signup', (req, res) => {
  const { username, password, email } = req.body;

  const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  db.query(sql, [username, password, email], (err, result) => {
    if (err) {
      console.error('DB 저장 실패:', err);
      return res.status(500).send('<script>alert("회원가입 실패"); history.back();</script>');
    }

    return res.send('<script>alert("회원가입 성공!"); location.href="/index.html";</script>');
  });
});

// ✅ 반드시 이 포트로 서버 실행
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
