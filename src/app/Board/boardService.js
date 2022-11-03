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
        if (quizTypeByIdxList == "객관식") {
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

// // 게시글 + 퀴즈 + 객관식 정답 등록
// exports.createBoardObjectQuiz = async ( userIdx, categoryIdx, title, question, quizType, hint, answerSelectIdx, answer ) => {
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
        const createQuizResponse = await boardDao.createQuiz(connection, question, quizType, boardIdx);
        const quizIdx = createQuizResponse.insertId;

        const result = { question, quizType, boardIdx, quizIdx }
        await connection.commit();
        return response(baseResponse.SUCCESS, result)
    } catch (err) {
        await connection.rollback();
        logger.error(`App - createQuiz Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


// 정답 등록
exports.createAnswer = async ( hint, answerSelectIdx, answer, quizIdx ) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        if (hint == "OBJECTIVE") {
            await connection.beginTransaction();
            const createObjectAnswerResponse = await boardDao.createObjectiveAnswer(connection, answer, answerSelectIdx, quizIdx);
            const result = { answer, answerSelectIdx, quizIdx }
            await connection.commit();
            return response(baseResponse.SUCCESS, result)
        } else {
            await connection.beginTransaction();
            const createSubjectAnswerResponse = await boardDao.createSubjectiveAnswer(connection, hint, answerSelectIdx, answer, quizIdx);
            const result = { hint, answerSelectIdx, answer, quizIdx }
            await connection.commit();
            return response(baseResponse.SUCCESS, result)
        }
    } catch (err) {
        await connection.rollback();
        logger.error(`App - createBoardQuiz Service error\n: ${err.message}`);
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