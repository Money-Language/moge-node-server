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

// // 게시글 + 퀴즈 + 객관식/주관식 정답 등록
// exports.createBoardQuiz = async ( title, userIdx, categoryIdx, quizType, question, hint, answerSelectIdx, answer ) => {
//     try {
//         const connection = await pool.getConnection(async (conn) => (conn));
//         const createBoardResponse = await boardDao.createBoard(connection, title, userIdx, categoryIdx);
//         const boardIdx = createBoardResponse.insertId

//         for (let quizIter of question) {
//             const createQuizResponse = await boardDao.createQuiz(connection, quizIter, quizType, boardIdx);
//             const quizIdx = createQuizResponse.insertId
//             console.log(`추가된 퀴즈 문제 인덱스 번호 : ${createQuizResponse.insertId}`);

//             if (quizType == "객관식") {
//                 for (objectiveIter of answer) {
//                     const createObjectiveAnswerResponse = await boardDao.createObjectiveAnswer(connection, objectiveIter, answerSelectIdx, quizIdx);
//                     console.log(`추가된 객관식 정답 인덱스 번호 : ${createObjectiveAnswerResponse.insertId}`);
//                 }
//             } else {
//                 for (subjectiveIter of answer) {
//                     const createSubjectiveAnswerResponse = await boardDao.createSubjectiveAnswer(connection, hint, answerSelectIdx, subjectiveIter, quizIdx);
//                     console.log(`추가된 주관식 정답 인덱스 번호 : ${createSubjectiveAnswerResponse.insertId}`);
//                 }
//             }
//         }
//         const result = { userIdx, categoryIdx, title, quizType, question, hint, answerSelectIdx, answer }
//         connection.release();
//         return response(baseResponse.SUCCESS, result)
//     } catch (err) {
//         logger.error(`App - createBoardQuiz Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
// }


// 게시글 + 퀴즈 + 객관식/주관식 정답 등록
exports.createBoardQuiz = async ( title, userIdx, categoryIdx, quizType, question, answer, answerSelectIdx ) => {
    try {
        const connection = await pool.getConnection(async (conn) => (conn));
        const createBoardResponse = await boardDao.createBoard(connection, title, userIdx, categoryIdx);
        const boardIdx = createBoardResponse.insertId
        console.log("삽입된 게시글 인덱스 번호 : " , boardIdx)

        for (let quizIter of question) {
            const createQuizResponse = await boardDao.createQuiz(connection, quizIter, quizType, boardIdx);
            const quizIdx = createQuizResponse.insertId
            console.log(`추가된 퀴즈 문제 인덱스 번호 : ${createQuizResponse.insertId}`);

            if (quizType == "객관식") {
                for (objectiveIter of answer) {
                    const createObjectiveAnswerResponse = await boardDao.createObjectiveAnswer(connection, objectiveIter, answerSelectIdx, quizIdx);
                    console.log(`추가된 객관식 정답 인덱스 번호 : ${createObjectiveAnswerResponse.insertId}`);
                }
            } else {
                for (subjectiveIter of answer) {
                    const createSubjectiveAnswerResponse = await boardDao.createSubjectiveAnswer(connection, hint, answerSelectIdx, subjectiveIter, quizIdx);
                    console.log(`추가된 주관식 정답 인덱스 번호 : ${createSubjectiveAnswerResponse.insertId}`);
                }
            }
        }
        const result = { userIdx, categoryIdx, title, quizType, question, hint, answerSelectIdx, answer }
        connection.release();
        return response(baseResponse.SUCCESS, result)
    } catch (err) {
        logger.error(`App - createBoardQuiz Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}