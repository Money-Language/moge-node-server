const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

// 이메일로 사용자 조회
exports.retrieveUserList = async function (email) {
  if (!email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};

// 사용자 ID로 회원 조회
exports.retrieveUser = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userIdx);

  connection.release();

  return userResult[0];
};

// 이메일 중복 확인
exports.emailCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserEmail(connection, email);
  connection.release();

  return emailCheckResult;
};

// 닉네임 중복 확인
exports.nicknameCheck = async function (nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const nicknameCheckResult = await userDao.selectUserNickName(connection, nickname);
  connection.release();

  return nicknameCheckResult;
};

// 비밀번호 확인
exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

// 사용자 게정 상태 체크
exports.accountCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, email);
  connection.release();

  return userAccountResult;
};

// 각 사용자가 작성한 게시글(피드) 조회
exports.viewFeedByUserIdx = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userFeedResult = await userDao.selectUserFeed(connection, userIdx);
  connection.release();
  return userFeedResult;
};

// 모든 게시글 조회
exports.viewBoard = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const userBoardResult = await userDao.selectBoard(connection);
  connection.release();
  return userBoardResult;
};