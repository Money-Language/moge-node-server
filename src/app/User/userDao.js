// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
                  SELECT userIdx, email, nickname 
                  FROM User;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// 이메일로 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserEmailQuery = `
                  SELECT email, nickname 
                  FROM User 
                  WHERE email = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, email);
  return emailRows;
}

// userIdx 회원 조회
async function selectUserId(connection, userIdx) {
  const selectUserIdQuery = `
                  SELECT userIdx, email, nickname 
                  FROM User 
                  WHERE userIdx = ?;
                `;
  const [userRow] = await connection.query(selectUserIdQuery, userIdx);
  return userRow;
}

// 닉네임으로 회원 조회
async function selectUserNickName(connection, nickname) {
  const selectNickNameQuery = `
                    SELECT email, nickname
                    FROM User
                    WHERE nickname = ?;
                `;
  const [nicknameRows] = await connection.query(selectNickNameQuery, nickname);
  return nicknameRows;
}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(email, password, nickname)
        VALUES (?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );
  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
          SELECT email, nickname, password
          FROM User
          WHERE email = ? AND password = ?;
        `;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );
  return selectUserPasswordRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, email) {
  const selectUserAccountQuery = `
          SELECT status, userIdx
          FROM User
          WHERE email = ?;
        `;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      email
  );
  return selectUserAccountRow[0];
}

// 소셜 로그인 유저 생성
async function insertSocialUser(connection, insertUserParams) {
  const insertUserQuery = `
    INSERT INTO User(email, nickname, profileImage, status)
    VALUES (?, ?, ?, ?);
  `;
  const insertUserRow = await connection.query(insertUserQuery, insertUserParams);
  return insertUserRow;
}

// 각 유저가 작성한 게시글(피드) 조회
async function selectUserFeed(connection, userIdx) {
  const selectUserFeedQuery = `
                      SELECT a.nickname,
                              a.profileImage,
                              CASE
                                WHEN TIMESTAMPDIFF(MINUTE, b.createdAt, NOW()) <= 0 THEN '방금 전'
                                WHEN TIMESTAMPDIFF(MINUTE, b.createdAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, b.createdAt, NOW()), '분 전')
                                WHEN TIMESTAMPDIFF(HOUR, b.createdAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, b.createdAt, NOW()), '시간 전')
                                WHEN TIMESTAMPDIFF(DAY, b.createdAt, NOW()) < 7 THEN CONCAT(TIMESTAMPDIFF(DAY, b.createdAt, NOW()), '일 전')
                                WHEN TIMESTAMPDIFF(WEEK, b.createdAt, NOW()) < 5 THEN CONCAT(TIMESTAMPDIFF(WEEK, b.createdAt, NOW()), '주 전')
                                ELSE CONCAT(TIMESTAMPDIFF(MONTH, b.createdAt, NOW()), '달 전')
                              END AS 'elapsedTime',
                              b.title,
                              COUNT(c.quizIdx) AS 'quizAmount',
                              b.viewCount
                      FROM User a
                      LEFT JOIN Board b on a.userIdx = b.userIdx
                      LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                      WHERE a.userIdx = ?;
                `;
  const [userFeedRow] = await connection.query(selectUserFeedQuery, userIdx);
  return userFeedRow;
}

// 모든 게시글 조회
async function selectBoard(connection) {
  const selectBoardQuery = `
                  SELECT *
                  FROM Board;
                `;
  const [boardRows] = await connection.query(selectBoardQuery);
  return boardRows;
}

module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  selectUserNickName,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  insertSocialUser,
  selectUserFeed,
  selectBoard
};