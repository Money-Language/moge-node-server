const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const boardDao = require("./boardDao");

// Provider: Read 비즈니스 로직 처리

// 각 사용자가 작성한 게시글(피드) 조회
exports.viewFeedByUserIdx = async function (userIdx, categoryName) {
    if (!categoryName) {
        // 카테고리 이름 req가 없을 때
        const connection = await pool.getConnection(async (conn) => conn);
        const userFeedResult = await boardDao.selectUserFeed(connection, userIdx);
        connection.release();
        return userFeedResult;
    } else {
        // 카테고리 이름 req가 있을 때
        const connection = await pool.getConnection(async (conn) => conn);
        const userCategoryFeedResult = await boardDao.selectUserCategoryFeed(connection, userIdx, categoryName);
        connection.release();
        return userCategoryFeedResult;
    }
};

// 모든 게시글 조회
exports.viewBoard = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const userBoardResult = await boardDao.selectBoard(connection);
    connection.release();
    return userBoardResult;
};

// 모든 카테고리 조회
exports.viewCategory = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryResult = await boardDao.selectCategory(connection);
    connection.release();
    return categoryResult;
};

// 유저가 선택한 카테고리 조회
exports.viewUserCategory = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userCategoryResult = await boardDao.selectUserCategory(connection, userIdx);
    connection.release();
    return userCategoryResult;
    };

// 각 카테고리의 제목, 서브제목 조회
exports.viewCategoryTitle = async function (categoryIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryTitleResult = await boardDao.categoryTitleInfo(connection, categoryIdx);
    connection.release();
    return categoryTitleResult;
};

// 각 카테고리별로 작성한 게시글(피드) 조회
exports.viewFeedByCategoryIdx = async function (categoryIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryFeedResult = await boardDao.selectCategoryFeed(connection, categoryIdx);
    connection.release();
    return categoryFeedResult;
};

// 모든 퀴즈 조회
exports.viewQuiz = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const quizResult = await boardDao.selectQuiz(connection);
    connection.release();
    return quizResult;
};

// 퀴즈 번호로 게시글 인덱스 조회
exports.viewBoardIdxByQuizIdx = async function (quizIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const boardIdxByQuizIdxResult = await boardDao.selectBoardIdxByQuizIdx(connection, quizIdx);
    connection.release();
    return boardIdxByQuizIdxResult;
};

// 각 게시글(피드) 별로 퀴즈 문제들 & 각 문제의 정답 조회
exports.viewQuizByBoardIdx = async function (boardIdx, quizIdx, answerSelectIdx) {

    if (!quizIdx && !answerSelectIdx) {
        // 퀴즈 인덱스 req랑 정답 인덱스 req 둘 다 없을 때
        const connection = await pool.getConnection(async (conn) => conn);
        const viewQuestionResult = await boardDao.selectBoardQuiz(connection, boardIdx);
        connection.release();
        return viewQuestionResult;
    } else if (quizIdx && !answerSelectIdx) {
        // 퀴즈 인덱스는 있지만 정답 인덱스 req가 없을 때
        const connection = await pool.getConnection(async (conn) => conn);
        const viewAnswerResult = await boardDao.selectQuizAnswer(connection, boardIdx, quizIdx);
        connection.release();
        return viewAnswerResult;
    } else if (quizIdx && answerSelectIdx) {
        // 퀴즈 인덱스 req와 정답 인덱스 req 둘 다 있을 때
        const connection = await pool.getConnection(async (conn) => conn);
        const quizTypeByIdxResult = await boardDao.selectQuizTypeByQuizIdx(connection, quizIdx);
        const quizTypeByIdxList = await Promise.all(quizTypeByIdxResult.map(async(val) => val.quizType))

        if (quizTypeByIdxList == "객관식") {
            const viewObjectiveAnswerCorrectResult = await boardDao.selectObjectiveQuizAnswerCorrect(connection, boardIdx, quizIdx, answerSelectIdx);
            connection.release();
            return viewObjectiveAnswerCorrectResult;
        } else if (quizTypeByIdxList == "주관식" && answerSelectIdx == '02') {
            return errResponse(baseResponse.SUBJECTIVE_ANSWERSELECTIDX_NOT_EXIST);
        } else {
            const viewSubjectiveAnswerCorrectResult = await boardDao.selectSubjectiveQuizAnswerCorrect(connection, boardIdx, quizIdx, answerSelectIdx);
            connection.release();
            return viewSubjectiveAnswerCorrectResult;
        }
    }
};

// 퀴즈 번호로 해당 퀴즈를 작성한 유저 인덱스 조회
exports.viewUserIdxByQuizIdx = async function (quizIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userIdxByQuizIdxResult = await boardDao.selectUserIdxByQuizIdx(connection, quizIdx);
    connection.release();
    return userIdxByQuizIdxResult;
};