const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const boardProvider = require("./boardProvider");
const boardDao = require("./boardDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

// 게시글 조회수 증가 
exports.updateCountView = async function (boardIdx) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const updateCountViewResult = await boardDao.updateViewCount(connection, boardIdx)
        connection.release();
        return response(baseResponse.SUCCESS, updateCountViewResult);

    } catch (err) {
        logger.error(`App - updateCountView Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}


// 퀴즈 완료 후 유저 포인트 획득
exports.updateUserPoint = async function (quizIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const quizTypeByIdxResult = await boardDao.selectQuizTypeByQuizIdx(connection, quizIdx);
        const quizTypeByIdxList = await Promise.all(quizTypeByIdxResult.map(async(val) => val.quizType))

        if (quizTypeByIdxList == 1) {
            const updateUserPointToObjectiveResult = await boardDao.userPointAfterObjectiveQuiz(connection, quizIdx, userIdx)
            await connection.commit();
            return response(baseResponse.SUCCESS, updateUserPointToObjectiveResult);
        } else {
            const updateUserPointToSubjectiveResult = await boardDao.userPointAfterSubjectiveQuiz(connection, quizIdx, userIdx)
            await connection.commit();
            return response(baseResponse.SUCCESS, updateUserPointToSubjectiveResult);
        }
    } catch (err) {
        await connection.rollback();
        logger.error(`App - updateUserPoint Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


// 오답 문제 풀이 완료시 포인트 획득
exports.updatePointAfterWrong = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    // 이용자가 오답복습 중 정답을 맞춘 날짜 조회하기
    const viewCorrectReviewDateResult = await boardDao.selectCorrectReviewDate(connection, userIdx);
    const correctReviewDateResultList = await Promise.all(viewCorrectReviewDateResult[0].map(async(val) => val.correctDate))
    // JavaScript에서 사용자의 현재 날짜 가져오기
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const dateString = year + '-' + month  + '-' + day;
    try {
        if (correctReviewDateResultList.includes(dateString)) {
            // 오답복습 데이터 중에 오늘 틀린 오답이 존재할 때
            await connection.beginTransaction();
            const updatePointAfterWrongTodayResult = await boardDao.userPointWrongAnswerToday(connection, userIdx, userIdx, userIdx, userIdx, userIdx)
            await connection.commit();
            return response(baseResponse.SUCCESS, updatePointAfterWrongTodayResult);
        } else {
           // 오답복습 데이터 중에 오늘 틀린 오답이 없을 때
            await connection.beginTransaction();
            const updatePointAfterWrongResult = await boardDao.userPointWrongAnswer(connection, userIdx, userIdx, userIdx)
            await connection.commit();
            return response(baseResponse.SUCCESS, updatePointAfterWrongResult);
        }
    } catch (err) {
        await connection.rollback();
        logger.error(`App - updatePointAfterWrong Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


// 게시글 등록
exports.createBoard = async ( userIdx, categoryIdx, title ) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const createBoardResponse = await boardDao.createBoard(connection, title, userIdx, categoryIdx);
        const boardIdx = createBoardResponse.insertId;

        const result = { boardIdx, title, userIdx, categoryIdx }
        await connection.commit();
        return response(baseResponse.SUCCESS, result)
    } catch (err) {
        await connection.rollback();
        logger.error(`App - createBoard Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


// 퀴즈 등록
exports.createQuiz = async ( question, quizType, boardIdx ) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const selectQuizByBoardIdxResult = await boardDao.selectBoardQuiz(connection, boardIdx);
        const categoryIdxByBoardIdxResult = await boardDao.selectCategoryIdxByBoardIdx(connection, boardIdx);
        const categoryIdxValue = await Promise.all(categoryIdxByBoardIdxResult[0].map(async(val) => val.categoryIdx))

        if (categoryIdxValue == 1 && quizType == 1) {
            return res.send(errResponse(baseResponse.NEW_WORDS_SUBJECTIVE_ONLY));
        } else if (categoryIdxValue == 2 && quizType == 2) {
            return res.send(errResponse(baseResponse.GRAMMERS_OBJECTIVE_ONLY));
        } else {
            if (selectQuizByBoardIdxResult.length > 15) {
                return res.send(errResponse(baseResponse.QUIZ_NOT_OVER_FIFTEEN))
            } else {
                const createQuizResponse = await boardDao.createQuiz(connection, question, quizType, boardIdx);
                const quizIdx = createQuizResponse.insertId;
                const result = { question, quizType, boardIdx, quizIdx }
                await connection.commit();
                return response(baseResponse.SUCCESS, result)
            }
        }
    } catch (err) {
        await connection.rollback();
        logger.error(`App - createQuiz Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


// 정답 등록
exports.createAnswer = async ( hint, content, isAnswer, quizIdx ) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        if (hint == "OBJECTIVE") {
            await connection.beginTransaction();
            const createObjectAnswerResponse = await boardDao.createObjectiveAnswer(connection, content, isAnswer, quizIdx);
            const result = { content, isAnswer, quizIdx }
            await connection.commit();
            return response(baseResponse.SUCCESS, result)
        } else {
            await connection.beginTransaction();
            const createSubjectAnswerResponse = await boardDao.createSubjectiveAnswer(connection, hint, content, isAnswer, quizIdx);
            const result = { hint, content, isAnswer, quizIdx }
            await connection.commit();
            return response(baseResponse.SUCCESS, result)
        }
    } catch (err) {
        await connection.rollback();
        logger.error(`App - createAnswer Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


// // 게시글 등록
// exports.createBoardObjectQuiz = async ( userIdx, categoryIdx, title ) => {
//     const connection = await pool.getConnection(async (conn) => conn);
//     try {
//         await connection.beginTransaction();
//         const createBoardResponse = await boardDao.createBoard(connection, title, userIdx, categoryIdx);
//         const boardIdx = createBoardResponse.insertId
//         console.log(boardIdx)  
//         for (let quizIter of (question || quizType)) {
//             console.log(quizIter);
//             // const createQuizResponse = await boardDao.createQuiz(connection, quizIter, boardIdx);
//             // const quizIdx = createQuizResponse.insertId;
//             // console.log(`추가된 퀴즈 문제 인덱스 번호 : ${createQuizResponse.insertId}`);

//             // for (objectiveIter of answer) {
//             //     const createObjectiveAnswerResponse = await boardDao.createObjectiveAnswer(connection, objectiveIter, answerSelectIdx, quizIdx);
//             //     console.log(`추가된 객관식 정답 인덱스 번호 : ${createObjectiveAnswerResponse.insertId}`);
//             // }
//         }
//         // const result = { userIdx, categoryIdx, title, quizType, question, hint, answerSelectIdx, answer }
//         // await connection.commit();
//         // return response(baseResponse.SUCCESS, result)
//     } catch (err) {
//         await connection.rollback();
//         logger.error(`App - createBoardQuiz Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     } finally {
//         connection.release();
//     }
// }


// 퀴즈 풀 때 틀린 답 적재
exports.stackWrongAnswer = async ( userIdx, categoryIdx, boardIdx, quizIdx ) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const stackWrongAnswerResult = await boardDao.stackWrongAnswer(connection, userIdx, categoryIdx, boardIdx, quizIdx);

        const result = { userIdx, categoryIdx, boardIdx, quizIdx }
        await connection.commit();
        return response(baseResponse.SUCCESS, result)
    } catch (err) {
        await connection.rollback();
        logger.error(`App - stackWrongAnswer Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


// 맞춘 오답 삭제
exports.removeWrongAnswer = async ( userIdx, quizIdx ) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const removeWrongAnswerResult = await boardDao.deleteWrongAnswer(connection, userIdx, quizIdx);

        await connection.commit();
        return response(baseResponse.SUCCESS)
    } catch (err) {
        await connection.rollback();
        logger.error(`App - removeWrongAnswer Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


// 게시글 신고하기
exports.createReportBoard = async ( content, userIdx, boardIdx ) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const boardInfoRows = await boardProvider.boardCheck(boardIdx);
        const boardInfoResult = await Promise.all(boardInfoRows.map(async(val) => val.status))

        if (boardInfoResult == 'INACTIVE') {
            return res.send(errResponse(baseResponse.BOARD_ALREADY_INACTIVE));
        } else if (boardInfoResult == 'DELETE') {
            return res.send(errResponse(baseResponse.BOARD_ALREADY_DELETE));
        } else {
            await connection.beginTransaction();
            const createReportBoardResponse = await boardDao.createReportBoard(connection, content, userIdx, boardIdx);
            const updateBoardByReportResult = await boardDao.updateBoardByReport(connection, boardIdx);
            const result = { content, userIdx, boardIdx }
            await connection.commit();
            return response(baseResponse.SUCCESS, result)
        }
    } catch (err) {
        await connection.rollback();
        logger.error(`App - createReportBoard Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


// 퀴즈 신고하기
exports.createReportQuiz = async ( content, userIdx, boardIdx, quizIdx ) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const quizInfoRows = await boardProvider.quizCheck(quizIdx);
        const quizInfoResult = await Promise.all(quizInfoRows.map(async(val) => val.status))

        if (quizInfoResult == 'INACTIVE') {
            return res.send(errResponse(baseResponse.QUIZ_ALREADY_INACTIVE));
        } else if (quizInfoResult == 'DELETE') {
            return res.send(errResponse(baseResponse.QUIZ_ALREADY_DELETE));
        } else {
            await connection.beginTransaction();
            const createReportQuizResponse = await boardDao.createReportQuiz(connection, content, userIdx, boardIdx, quizIdx);
            const updateQuizByReportResult = await boardDao.updateQuizByReport(connection, boardIdx, quizIdx)
            const result = { content, userIdx, boardIdx, quizIdx }
            await connection.commit();
            return response(baseResponse.SUCCESS, result)
        }
    } catch (err) {
        await connection.rollback();
        logger.error(`App - createReportQuiz Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}