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
        const categoryIdxByBoardIdxResult = await boardDao.selectCategoryIdxByBoardIdx(connection, boardIdx);
        const categoryIdxValue = await Promise.all(categoryIdxByBoardIdxResult[0].map(async(val) => val.categoryIdx))

        if (categoryIdxValue == 1 && quizType == 1) {
            return res.send(errResponse(baseResponse.NEW_WORDS_SUBJECTIVE_ONLY));
        } else if (categoryIdxValue == 2 && quizType == 2) {
            return res.send(errResponse(baseResponse.GRAMMERS_OBJECTIVE_ONLY));
        } else {
            const createQuizResponse = await boardDao.createQuiz(connection, question, quizType, boardIdx);
            const quizIdx = createQuizResponse.insertId;
            const result = { question, quizType, boardIdx, quizIdx }
            await connection.commit();
            return response(baseResponse.SUCCESS, result)
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