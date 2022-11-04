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

// 소셜로그인 고유 ID로 회원 조회
async function selectUserSocialCreatedID(connection, socialCreatedID) {
  const selectUserSocialCreatedIDQuery = `
                  SELECT email, nickname, socialCreatedID
                  FROM User 
                  WHERE socialCreatedID = ?;
                `;
  const [selectUserSocialCreatedIDRows] = await connection.query(selectUserSocialCreatedIDQuery, socialCreatedID);
  return selectUserSocialCreatedIDRows;
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

// 소셜로그인 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserSocialAccount(connection, socialCreatedID) {
  const selectUserSocialAccountQuery = `
          SELECT status, userIdx
          FROM User
          WHERE socialCreatedID = ?;
        `;
  const selectUserSocialAccountRow = await connection.query(
    selectUserSocialAccountQuery,
    socialCreatedID
  );
  return selectUserSocialAccountRow[0];
}

// 소셜 로그인 유저 생성
async function insertSocialUser(connection, insertUserParams) {
  const insertUserQuery = `
    INSERT INTO User(email, nickname, profileImage, socialCreatedID, status)
    VALUES (?, ?, ?, ?, ?);
  `;
  const insertUserRow = await connection.query(insertUserQuery, insertUserParams);
  return insertUserRow;
}


module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  selectUserNickName,
  selectUserSocialCreatedID,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  selectUserSocialAccount,
  insertSocialUser
};