const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 가비아 DB 연결 정보
const db_config = {
  host: 'my8003.gabiadb.com',
  user: 'tm0409',
  password: 'david767929',
  database: 'taemindb'
};

let db;

// ✅ 연결 유지 및 재연결 핸들러
function handleDisconnect() {
  db = mysql.createConnection(db_config);

  db.connect(err => {
    if (err) {
      console.error('MySQL 연결 실패:', err);
      setTimeout(handleDisconnect, 2000); // 2초 후 재시도
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

// ✅ 정적 파일 서비스 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ 루트 경로 접근 시 index.html 반환
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ 회원가입 처리 API
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

// ✅ 서버 실행
app.l
