const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

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

// 미들웨어
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ 아이디 중복 체크 API
app.get('/check-username', (req, res) => {
  const { username } = req.query;
  const sql = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';

  db.query(sql, [username], (err, result) => {
    if (err) {
      console.error('중복 확인 오류:', err);
      return res.status(500).json({ error: 'DB 오류' });
    }

    res.json({ exists: result[0].count > 0 });
  });
});

// ✅ 회원가입 처리
app.post('/signup', (req, res) => {
  const { username, password, email } = req.body;

  const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  db.query(sql, [username, password, email], (err, result) => {
    if (err) {
      console.error('DB 저장 실패:', err);
      return res.status(500).send('<script>alert("회원가입 실패"); history.back();</script>');
    }

    res.send('<script>alert("회원가입 성공!"); location.href="/index.html";</script>');
  });
});

// 서버 실행
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
app.get('/users', (req, res) => {
  const sql = 'SELECT username, password, email FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('회원 리스트 불러오기 실패:', err);
      return res.status(500).send('서버 에러');
    }

    let html = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>회원 리스트</title>
        <style>
          table { border-collapse: collapse; width: 80%; margin: 30px auto; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h1 style="text-align:center;">회원 리스트</h1>
        <table>
          <tr><th>아이디</th><th>비밀번호</th><th>이메일</th></tr>`;

    results.forEach(row => {
      html += `<tr><td>${row.username}</td><td>${row.password}</td><td>${row.email}</td></tr>`;
    });

    html += `
        </table>
      </body>
      </html>
    `;
    res.send(html);
  });
});
