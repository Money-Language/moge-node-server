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

// 각 카테고리별로 작성한 게시글(피드) 조회 - 최신순
exports.viewFeedByCategoryIdx = async function (categoryIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryFeedResult = await boardDao.selectCategoryFeed(connection, categoryIdx);
    connection.release();
    return categoryFeedResult;
};

// 각 카테고리별로 작성한 게시글(피드) 조회 - 조회순
exports.viewFeedOrderViewByCategoryIdx = async function (categoryIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryFeedOrderViewResult = await boardDao.selectCategoryFeedOrderView(connection, categoryIdx);
    connection.release();
    return categoryFeedOrderViewResult;
};

// 각 카테고리별로 작성한 게시글(피드) 조회 - 인기순
exports.viewFeedOrderLikeByCategoryIdx = async function (categoryIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const categoryFeedOrderLikeResult = await boardDao.selectCategoryFeedOrderLike(connection, categoryIdx);
    connection.release();
    return categoryFeedOrderLikeResult;
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

// // 각 게시글(피드) 별로 퀴즈 문제들 & 각 문제의 정답 조회
// exports.viewQuizByBoardIdx = async function (boardIdx, quizIdx, isAnswer) {

//     if (!quizIdx && !isAnswer) {
//         // 퀴즈 인덱스 req랑 정답 인덱스 req 둘 다 없을 때
//         const connection = await pool.getConnection(async (conn) => conn);
//         const viewQuestionResult = await boardDao.selectBoardQuiz(connection, boardIdx);
//         connection.release();
//         return viewQuestionResult;
//     } else if (quizIdx && !isAnswer) {
//         // 퀴즈 인덱스는 있지만 정답 인덱스 req가 없을 때
//         const connection = await pool.getConnection(async (conn) => conn);
//         const viewAnswerResult = await boardDao.selectQuizAnswer(connection, boardIdx, quizIdx);
//         connection.release();
//         return viewAnswerResult;
//     } else if (quizIdx && isAnswer) {
//         // 퀴즈 인덱스 req와 정답 인덱스 req 둘 다 있을 때
//         const connection = await pool.getConnection(async (conn) => conn);
//         const quizTypeByIdxResult = await boardDao.selectQuizTypeByQuizIdx(connection, quizIdx);
//         const quizTypeByIdxList = await Promise.all(quizTypeByIdxResult.map(async(val) => val.quizType))

//         if (quizTypeByIdxList == 0) {
//             const viewObjectiveAnswerCorrectResult = await boardDao.selectObjectiveQuizAnswerCorrect(connection, boardIdx, quizIdx, isAnswer);
//             connection.release();
//             return viewObjectiveAnswerCorrectResult;
//         } else if (quizTypeByIdxList == 1 && answerSelectIdx == 0) {
//             return errResponse(baseResponse.SUBJECTIVE_ANSWERSELECTIDX_NOT_EXIST);
//         } else {
//             const viewSubjectiveAnswerCorrectResult = await boardDao.selectSubjectiveQuizAnswerCorrect(connection, boardIdx, quizIdx, isAnswer);
//             connection.release();
//             return viewSubjectiveAnswerCorrectResult;
//         }
//     }
// };

// 각 게시글(피드) 별로 퀴즈 문제들 & 각 문제의 정답 조회
exports.viewQuizByBoardIdx = async function (boardIdx, quizIdx) {

    if (!quizIdx) {
        // 퀴즈 인덱스 req가 없을 때
        const connection = await pool.getConnection(async (conn) => conn);
        const viewQuestionResult = await boardDao.selectBoardQuiz(connection, boardIdx);
        connection.release();
        return viewQuestionResult;
    } else {
        // 퀴즈 인덱스 req가 있을 때
        const connection = await pool.getConnection(async (conn) => conn);
        const viewAnswerResult = await boardDao.selectQuizAnswer(connection, boardIdx, quizIdx);
        connection.release();
        return viewAnswerResult;
    } 
};

// 퀴즈 번호로 해당 퀴즈를 작성한 유저 인덱스 조회
exports.viewUserIdxByQuizIdx = async function (quizIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userIdxByQuizIdxResult = await boardDao.selectUserIdxByQuizIdx(connection, quizIdx);
    connection.release();
    return userIdxByQuizIdxResult;
};

// 오답이 있는 날짜 조회
exports.viewWrongAnswerDate = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const viewWrongAnswerDateResult = await boardDao.selectWrongAnswerDate(connection, userIdx);
    connection.release();
    return viewWrongAnswerDateResult;
};

// 날짜로 해당 날짜의 오답 조회
exports.viewWrongAnswerByDate = async function (userIdx, date) {
    const connection = await pool.getConnection(async (conn) => conn);
    const viewWrongAnswerByDateResult = await boardDao.selectWrongAnswerByDate(connection, userIdx, date);
    connection.release();
    return viewWrongAnswerByDateResult;
};

// 오답 복습 퀴즈 문제 전체 조회
exports.viewWrongWholeQuiz = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const viewWrongWholeQuizResult = await boardDao.selectWrongAnswerWholeQuiz(connection, userIdx);
    connection.release();
    return viewWrongWholeQuizResult;
};

// 오답 복습 퀴즈 문제 낱개 조회
exports.viewWrongElementQuiz = async function (userIdx, quizIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const viewWrongElementQuizResult = await boardDao.selectWrongAnswerElementQuiz(connection, userIdx, quizIdx);
    connection.release();
    return viewWrongElementQuizResult;
};

// 오답 복습 퀴즈 정답 내용 조회
exports.viewWrongAnswerContents = async function (userIdx, quizIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const viewWrongAnswerContentsResult = await boardDao.selectWrongAnswerContents(connection, userIdx, quizIdx);
    connection.release();
    return viewWrongAnswerContentsResult;
};

// 게시글 번호로 게시글 작성한 유저 인덱스 조회
exports.viewUserIdxByBoardIdx = async function (boardIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userIdxByBoardIdxResult = await boardDao.selectUserIdxByBoardIdx(connection, boardIdx);
    connection.release();
    return userIdxByBoardIdxResult;
};

// 자기가 신고했던 게시글 조회
exports.viewBoardAfterReport = async function (userIdx, boardIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const boardAfterReportResult = await boardDao.selectBoardAfterReport(connection, userIdx, boardIdx);
    connection.release();
    return boardAfterReportResult;
};

// 게시글 상태 체크
exports.boardCheck = async function (boardIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const boardStatusResult = await boardDao.selectBoardStatus(connection, boardIdx);
    connection.release();
    return boardStatusResult;
};

// 자기가 신고했던 퀴즈 조회
exports.viewQuizAfterReport = async function (userIdx, boardIdx, quizIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const quizAfterReportResult = await boardDao.selectQuizAfterReport(connection, userIdx, boardIdx, quizIdx);
    connection.release();
    return quizAfterReportResult;
};

// 퀴즈 상태 체크
exports.quizCheck = async function (quizIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const quizStatusResult = await boardDao.selectQuizStatus(connection, quizIdx);
    connection.release();
    return quizStatusResult;
};