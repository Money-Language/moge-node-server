const jwtMiddleware = require("../../../config/jwtMiddleware");
const boardProvider = require("../../app/Board/boardProvider");
const boardService = require("../../app/Board/boardService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const { logger } = require('../../../config/winston');

const secret_config = require('../../../config/secret');
const {emit} = require("nodemon");
const jwt = require('jsonwebtoken');
const e = require("express");


/**
 * API No. 3
 * API Name : 각 유저가 작성한 게시글(피드) 조회
 * [GET] /app/users/{userIdx}/boards?=categoryName
 */
exports.getBoardListByIdx = async function (req, res) {
    /**
     * Query String : categoryName
     * Path Variable : userIdx
     */
    const userIdx = req.params.userIdx;
    const categoryName = req.query.categoryName
    const userIdFromJWT = req.verifiedToken.userIdx;
    const boardResult = await boardProvider.viewBoard();
    const categoryResult = await boardProvider.viewCategory();
    const userCategoryResult = await boardProvider.viewUserCategory(userIdx);
    const boardUserIdxList = await Promise.all(boardResult.map(async(val) => val.userIdx))
    const boardCategoryIdx = await Promise.all(categoryResult.map(async(val) => val.categoryIdx))
    const boardUserCategoryIdx = await Promise.all(userCategoryResult.map(async(val) => val.categoryIdx))

    if(!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!boardUserIdxList.includes(parseInt(userIdx))) {
            return res.send(errResponse(baseResponse.USER_BOARD_LIST_EMPTY));
        } else {
            if (!categoryName) {
                // 유저가 작성한 게시글 전체 조회
                const feedByUserIdx = await boardProvider.viewFeedByUserIdx(userIdx);
                return res.send(response(baseResponse.SUCCESS, feedByUserIdx));
            } else {
                // 유가 작성한 게시글 카테고리별로 필터링 조회
                const categoryFeedByUserIdx = await boardProvider.viewFeedByUserIdx(userIdx, categoryName);
                for (i=0; i < boardCategoryIdx.length; i++) {
                    if (!boardCategoryIdx.filter(x => boardUserCategoryIdx.includes(x))) {
                        return res.send(errResponse(baseResponse.CATEGORY_CATEGORY_IDX_NOT_EXIST));
                    } else {
                        return res.send(response(baseResponse.SUCCESS, categoryFeedByUserIdx));
                    }
                }
            }
        }
    }
};


/**
 * API No. 4
 * API Name : 게시글 조회수 증가 API
 * [POST] /app/boards/{boardIdx}/view-count
 */
exports.increaseViewCount = async function (req, res) {

    const boardIdx = req.params.boardIdx;

    if(!boardIdx) return res.send(errResponse(baseResponse.BOARD_BOARDIDX_EMPTY));
    const updateCountView = await boardService.updateCountView(boardIdx);
    return res.send(updateCountView)
}


/**
 * API No. 5
 * API Name : 각 카테고리 별로 게시글(피드) 조회 (홈화면 조회)
 * [GET] /app/boards/{categoryIdx}
 */
exports.getBoardListBycategoryIdx = async function (req, res) {
    /**
     * Path Parameter : categoryIdx
     */
    const categoryIdx = req.params.categoryIdx;
    const order = req.query.order;
    const boardResult = await boardProvider.viewBoard();
    const categoryResult = await boardProvider.viewCategory();
    const boardCategoryIdxList = await Promise.all(boardResult.map(async(val) => val.categoryIdx))
    const categoryIdxList = await Promise.all(categoryResult.map(async(val) => val.categoryIdx))

    if (!categoryIdxList.includes(parseInt(categoryIdx))) {
        return res.send(errResponse(baseResponse.CATEGORY_CATEGORY_IDX_NOT_EXIST));
    } else {
        if (!boardCategoryIdxList.includes(parseInt(categoryIdx))) {
            return res.send(errResponse(baseResponse.CATEGORY_LIST_EMPTY));
        } else {
            if (order == "view") {
                const feedOrderViewByCategoryIdx = await boardProvider.viewFeedOrderViewByCategoryIdx(categoryIdx);
                return res.send(response(baseResponse.SUCCESS, feedOrderViewByCategoryIdx));
            } else if (order == "like") {
                const feedOrderLikeByCategoryIdx = await boardProvider.viewFeedOrderLikeByCategoryIdx(categoryIdx);
                return res.send(response(baseResponse.SUCCESS, feedOrderLikeByCategoryIdx));
            } else {
                const feedByCategoryIdx = await boardProvider.viewFeedByCategoryIdx(categoryIdx);
                return res.send(response(baseResponse.SUCCESS, feedByCategoryIdx));
            }
        }
    }
};


/**
 * API No. 6
 * API Name : 각 카테고리 별로 카테고리 이름, 서브타이틀 조회
 * [GET] /app/boards/{categoryIdx}/category-name
 */
exports.getCategoryTitleBycategoryIdx = async function (req, res) {
    /**
     * Path Parameter : categoryIdx
     */
    const categoryIdx = req.params.categoryIdx;
    const boardResult = await boardProvider.viewBoard();
    const categoryResult = await boardProvider.viewCategory();
    const boardCategoryIdxList = await Promise.all(boardResult.map(async(val) => val.categoryIdx))
    const categoryIdxList = await Promise.all(categoryResult.map(async(val) => val.categoryIdx))

    if (!categoryIdxList.includes(parseInt(categoryIdx))) {
        return res.send(errResponse(baseResponse.CATEGORY_CATEGORY_IDX_NOT_EXIST));
    } else {
        if (!boardCategoryIdxList.includes(parseInt(categoryIdx))) {
            return res.send(errResponse(baseResponse.CATEGORY_LIST_EMPTY));
        }
        else {
            const categoryTitleResult = await boardProvider.viewCategoryTitle(categoryIdx);
            return res.send(response(baseResponse.SUCCESS, categoryTitleResult[0]));
        }
    }
};


// /**
//  * API No. 7
//  * API Name : 각 게시글(피드) 별로 퀴즈 문제들 조회 ( + 답안 + 답안 보기도 조회 )
//  * [GET] /app/boards/{boardIdx}/quiz
//  */
// exports.getQuizByBoardIdx = async function (req, res) {
//     /**
//      * Path Parameter : boardIdx
//      * Query String : quizIdx, answerSelectIdx
//      */
//     const boardIdx = req.params.boardIdx;
//     const quizIdx = req.query.quizIdx;
//     const answerSelectIdx = req.query.answerSelectIdx;
//     const boardResult = await boardProvider.viewBoard();
//     const quizResult = await boardProvider.viewQuiz();
//     const boardIdxList = await Promise.all(boardResult.map(async(val) => val.boardIdx))
//     const quizIdxList = await Promise.all(quizResult.map(async(val) => val.quizIdx))

//     if(!boardIdx) return res.send(errResponse(baseResponse.BOARD_BOARDIDX_EMPTY));
//     if (!boardIdxList.includes(parseInt(boardIdx))) {
//         return res.send(errResponse(baseResponse.BOARD_BOARDIDX_NOT_EXIST));
//     } else {
//         if (!quizIdx) {
//             // 피드 당 전체 퀴즈 문제 조회
//             const boardQuizByBoardIdx = await boardProvider.viewQuizByBoardIdx(boardIdx);
//             return res.send(response(baseResponse.SUCCESS, boardQuizByBoardIdx));
//         } else if (quizIdx && !answerSelectIdx) {
//             // 각 문제당 정답 조회
//             const viewAnswerByQuizIdx = await boardProvider.viewQuizByBoardIdx(boardIdx, quizIdx);
//             const boardIdxByQuizIdxResult = await boardProvider.viewBoardIdxByQuizIdx(quizIdx);
//             const quizIdxByOneBoardIdx = await Promise.all(boardIdxByQuizIdxResult.map(async(val) => val.boardIdx))
//             for (i=0; i < quizIdxList.length; i++) {
//                 if (!quizIdxList.includes(parseInt(quizIdx))) {
//                     return res.send(errResponse(baseResponse.QUIZ_QUIZIDX_NOT_EXIST));
//                 } else if (!quizIdxByOneBoardIdx.includes(parseInt(boardIdx))) {
//                     return res.send(errResponse(baseResponse.QUIZ_BOARDIDX_NOT_EXIST));
//                 } else {
//                     return res.send(response(baseResponse.SUCCESS, viewAnswerByQuizIdx));
//                 }
//             }
//         } else if (quizIdx && answerSelectIdx) {
//             // 각 문제당 정답 여부 조회
//             const viewAnswerCorrectByQuizIdx = await boardProvider.viewQuizByBoardIdx(boardIdx, quizIdx, answerSelectIdx);
//             if (answerSelectIdx !== "01" && answerSelectIdx !== "02") {
//                 return res.send(errResponse(baseResponse.ANSWER_ANSWERSELECTIDX_INCORRECT));
//             } else {
//                 return res.send(response(baseResponse.SUCCESS, viewAnswerCorrectByQuizIdx));
//             }
//         }
//     }
// };


/**
 * API No. 7
 * API Name : 각 게시글(피드) 별로 퀴즈 문제들 조회 ( + 답안 + 답안 보기도 조회 )
 * [GET] /app/boards/{boardIdx}/quiz
 */
exports.getQuizByBoardIdx = async function (req, res) {
    /**
     * Path Parameter : boardIdx
     * Query String : quizIdx
     */
    const boardIdx = req.params.boardIdx;
    const quizIdx = req.query.quizIdx;
    const boardResult = await boardProvider.viewBoard();
    const quizResult = await boardProvider.viewQuiz();
    const boardIdxList = await Promise.all(boardResult.map(async(val) => val.boardIdx))
    const quizIdxList = await Promise.all(quizResult.map(async(val) => val.quizIdx))

    if(!boardIdx) return res.send(errResponse(baseResponse.BOARD_BOARDIDX_EMPTY));
    if (!boardIdxList.includes(parseInt(boardIdx))) {
        return res.send(errResponse(baseResponse.BOARD_BOARDIDX_NOT_EXIST));
    } else {
        if (!quizIdx) {
            // 피드 당 전체 퀴즈 문제 조회
            const boardQuizByBoardIdx = await boardProvider.viewQuizByBoardIdx(boardIdx);
            return res.send(response(baseResponse.SUCCESS, boardQuizByBoardIdx));
        } else {
            // 각 문제당 정답 조회
            const viewAnswerByQuizIdx = await boardProvider.viewQuizByBoardIdx(boardIdx, quizIdx);
            const boardIdxByQuizIdxResult = await boardProvider.viewBoardIdxByQuizIdx(quizIdx);
            const quizIdxByOneBoardIdx = await Promise.all(boardIdxByQuizIdxResult.map(async(val) => val.boardIdx))
            for (i=0; i < quizIdxList.length; i++) {
                if (!quizIdxList.includes(parseInt(quizIdx))) {
                    return res.send(errResponse(baseResponse.QUIZ_QUIZIDX_NOT_EXIST));
                } else if (!quizIdxByOneBoardIdx.includes(parseInt(boardIdx))) {
                    return res.send(errResponse(baseResponse.QUIZ_BOARDIDX_NOT_EXIST));
                } else {
                    return res.send(response(baseResponse.SUCCESS, viewAnswerByQuizIdx));
                }
            }
        }
    }
};


/**
 * API No. 8
 * API Name : 퀴즈 완료 후 유저 포인트 획득 API
 * [POST] /app/users/{userIdx}/get-points
 */
exports.increaseUserPoint = async function (req, res) {

    const userIdx = req.params.userIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const { quizIdx } = req.body;
    const viewUserIdxByQuizIdxResult = await boardProvider.viewUserIdxByQuizIdx(quizIdx);
    const userIdxByQuizIdxResultList = await Promise.all(viewUserIdxByQuizIdxResult[0].map(async(val) => val.userIdx))

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!quizIdx) return res.send(errResponse(baseResponse.POINT_QUIZIDX_EXIST));
        if (userIdxByQuizIdxResultList.includes(parseInt(userIdx))) {
            return res.send(errResponse(baseResponse.USER_QUIZ_MAKER_SAME));
        } else {
            const updateUserPointResult = await boardService.updateUserPoint(quizIdx, userIdx);
            return res.send(updateUserPointResult)
        }
    }
}


/**
 * API No. 9
 * API Name : 게시글 등록 API
 * [POST] /app/users/{userIdx}/boards
 */
exports.postBoard = async function (req, res) {

    const userIdx = req.params.userIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const { categoryIdx, title } = req.body;

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!categoryIdx) return res.send(errResponse(baseResponse.BOARD_CATEGORYIDX_NOT_EXIST));
        if (!title) return res.send(errResponse(baseResponse.BOARD_TITLE_NOT_EXIST));

        const boardQuizResponse = await boardService.createBoard( userIdx, categoryIdx, title );
        return res.send(boardQuizResponse)
    }
}


/**
 * API No. 10
 * API Name : 퀴즈 등록 API
 * [POST] /app/users/{userIdx}/quiz
 */
exports.postQuiz = async function (req, res) {

    const userIdx = req.params.userIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const { question, quizType, boardIdx } = req.body;

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!question) return res.send(errResponse(baseResponse.BOARD_QUIZ_QUESTION_NOT_EXIST));
        if (!quizType) return res.send(errResponse(baseResponse.BOARD_QUIZ_QUIZTYPE_NOT_EXIST));
        if (!boardIdx) return res.send(errResponse(baseResponse.BOARD_BOARDIDX_EMPTY));

        const boardQuizResponse = await boardService.createQuiz( question, quizType, boardIdx );
        return res.send(boardQuizResponse)
    }
}


/**
 * API No. 11
 * API Name : 정답 등록 API
 * [POST] /app/users/{userIdx}/answer
 */
exports.postAnswer = async function (req, res) {

    const userIdx = req.params.userIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const { hint, content, isAnswer, quizIdx } = req.body;

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!hint) return res.send(errResponse(baseResponse.BOARD_ANSWER_HINT_NOT_EXIST));
        if (!content) return res.send(errResponse(baseResponse.BOARD_ANSWER_ANSWER_EXIST));
        if (!isAnswer) return res.send(errResponse(baseResponse.BOARD_ANSWER_SELECTIDX_NOT_EXIST));
        if (!quizIdx) return res.send(errResponse(baseResponse.BOARD_QUIZIDX_NOT_EXIST));

        const boardQuizResponse = await boardService.createAnswer( hint, content, isAnswer, quizIdx );
        return res.send(boardQuizResponse)
    }
}


/**
 * API No. 10
 * API Name : 게시글 + 주관식 퀴즈 등록 API
 * [POST] /app/users/{userIdx}/subjective-quiz
 */
// exports.postBoardSubjectiveQuiz = async function (req, res) {

    // const userIdx = req.params.userIdx;
    // const userIdFromJWT = req.verifiedToken.userIdx;
    // const { categoryIdx, title, quizList } = req.body;

    // const question = await Promise.all(quizList.map(async(val) => val.question))
    // const quizType = await Promise.all(quizList.map(async(val) => val.quizType))

    // const answerList = await Promise.all(quizList.map(async(val) => val.answerList))
    // const hint = await Promise.all(answerList.map(async(val) => val.hint))
    // const answerSelectIdx = await Promise.all(answerList.map(async(val) => val.answerSelectIdx))
    // const answer = await Promise.all(answerList.map(async(val) => val.answer))

    // if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    // if (userIdFromJWT != userIdx) {
    //     return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG))
    // } else {
    //     if (!categoryIdx) return res.send(errResponse(baseResponse.BOARD_CATEGORYIDX_NOT_EXIST));
    //     if (!title) return res.send(errResponse(baseResponse.BOARD_TITLE_NOT_EXIST));
    //     if (!question) return res.send(errResponse(baseResponse.BOARD_QUIZ_QUESTION_NOT_EXIST));
    //     if (!quizType) return res.send(errResponse(baseResponse.BOARD_QUIZ_QUIZTYPE_NOT_EXIST));
    //     if (!hint) return res.send(errResponse(baseResponse.BOARD_ANSWER_HINT_NOT_EXIST));
    //     if (!answerSelectIdx) return res.send(errResponse(baseResponse.BOARD_ANSWER_SELECTIDX_NOT_EXIST));
    //     if (!answer) return res.send(errResponse(baseResponse.BOARD_ANSWER_ANSWER_EXIST));

        // for (i = 0; i < answerList.length; i++) {
        //     const hint = await Promise.all(answerList[i].map((val) => val.hint));
        //     const answerSelectIdx = await Promise.all(answerList[i].map(async(val) => val.answerSelectIdx));
        //     const answer = await Promise.all(answerList[i].map(async(val) => val.answer));

        //     if (!hint) return res.send(errResponse(baseResponse.BOARD_ANSWER_HINT_NOT_EXIST));
        //     if (!answerSelectIdx) return res.send(errResponse(baseResponse.BOARD_ANSWER_SELECTIDX_NOT_EXIST));
        //     if (!answer) return res.send(errResponse(baseResponse.BOARD_ANSWER_ANSWER_EXIST));

        //     const boardQuizResponse = await boardService.createBoardObjectQuiz( userIdx, categoryIdx, title, question, quizType, hint, answerSelectIdx, answer );
        //     return res.send(boardQuizResponse)
        // }

    //     const boardQuizResponse = await boardService.createBoardQuiz( userIdx, categoryIdx, title, question, quizType, hint, answerSelectIdx, answer );
    //     return res.send(boardQuizResponse)
    // }
// }


/**
 * API No. 15
 * API Name : 사용자 오답 적재 API
 * [POST] /app/users/{userIdx}/wrong-answer
 */
exports.postWrongAnswer = async function (req, res) {

    const userIdx = req.params.userIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const { categoryIdx, boardIdx, quizIdx } = req.body;

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!categoryIdx) return res.send(errResponse(baseResponse.BOARD_CATEGORYIDX_NOT_EXIST));
        if (!boardIdx) return res.send(errResponse(baseResponse.BOARD_BOARDIDX_EMPTY));
        if (!quizIdx) return res.send(errResponse(baseResponse.BOARD_QUIZIDX_NOT_EXIST));

        const wrongAnswerResponse = await boardService.stackWrongAnswer( userIdx, categoryIdx, boardIdx, quizIdx );
        return res.send(wrongAnswerResponse)
    }
}


/**
 * API No. 16
 * API Name : 맞춘 오답 삭제 API
 * [DELETE] /app/users/{userIdx}/wrong-answer
 */
exports.deleteWrongAnswer = async function (req, res) {

    const userIdx = req.params.userIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const { quizIdx } = req.body;

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!quizIdx) return res.send(errResponse(baseResponse.BOARD_QUIZIDX_NOT_EXIST));

        const deleteWrongAnswerResponse = await boardService.removeWrongAnswer( userIdx, quizIdx );
        return res.send(deleteWrongAnswerResponse)
    }
}


/**
 * API No. 17
 * API Name : 오답이 있는 날짜 조회 API
 * [GET] /app/users/{userIdx}/wrong-answer/date
 */
exports.getWrongAnswerDate = async function (req, res) {

    const userIdx = req.params.userIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const date = req.query.date;

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!date) {
            const getWrongAnswerDateResponse = await boardProvider.viewWrongAnswerDate( userIdx );
            return res.send(response(baseResponse.SUCCESS, getWrongAnswerDateResponse[0]));
        } else {
            const getWrongAnswerByDateResponse = await boardProvider.viewWrongAnswerByDate( userIdx, date );
            return res.send(response(baseResponse.SUCCESS, getWrongAnswerByDateResponse[0]));
        }
    }
}


/**
 * API No. 18
 * API Name : 오답 복습 퀴즈 문제 조회
 * [GET] /app/users/{userIdx}/wrong-answer
 */
exports.getWrongAnswerQuiz = async function (req, res) {

    const userIdx = req.params.userIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const quizIdx = req.query.quizIdx;

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!quizIdx) {
            const getWrongAnswerDateResponse = await boardProvider.viewWrongWholeQuiz( userIdx );
            return res.send(response(baseResponse.SUCCESS, getWrongAnswerDateResponse[0]));
        } else {
            const getWrongAnswerByDateResponse = await boardProvider.viewWrongElementQuiz( userIdx, quizIdx );
            return res.send(response(baseResponse.SUCCESS, getWrongAnswerByDateResponse[0]));
        }
    } 
}


/**
 * API No. 19
 * API Name : 오답 복습 퀴즈 정답 보기 조회
 * [GET] /app/users/{userIdx}/wrong-answer/{quizIdx}
 */
exports.getWrongAnswerContents = async function (req, res) {

    const { userIdx, quizIdx } = req.params;
    const userIdFromJWT = req.verifiedToken.userIdx;

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!quizIdx) {
            return res.send(errResponse(baseResponse.BOARD_QUIZIDX_NOT_EXIST));
        } else {
            const getWrongAnswerContentsResponse = await boardProvider.viewWrongAnswerContents( userIdx, quizIdx );
            return res.send(response(baseResponse.SUCCESS, getWrongAnswerContentsResponse[0]));
        }
    } 
}


/**
 * API No. 20
 * API Name : 게시글 신고하기 API
 * [POST] /app/boards/{boardIdx}/report
 */
exports.postReportBoard = async function (req, res) {

    const boardIdx = req.params.boardIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const { content, userIdx } = req.body;

    const boardWriterResult = await boardProvider.viewUserIdxByBoardIdx(boardIdx);
    const boardWriter = await Promise.all(boardWriterResult[0].map(async(val) => val.userIdx))
    const getBoardAfterReportResult = await boardProvider.viewBoardAfterReport(userIdx, boardIdx);

    if (!boardIdx) return res.send(errResponse(baseResponse.BOARD_BOARDIDX_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!content) return res.send(errResponse(baseResponse.REPORT_CONTENT_EMPTY));
        if (boardWriter == userIdx) {
            return res.send(errResponse(baseResponse.REPORT_BOARD_WRITER_SAME));
        } else {
            if (getBoardAfterReportResult[0].length > 0) {
                return res.send(errResponse(baseResponse.REPORT_NOT_OVER_TWICE_SAME));
            } else {
                const reportBoardResponse = await boardService.createReportBoard( content, userIdx, boardIdx );
                return res.send(reportBoardResponse)
            }
        }
    }
}


/**
 * API No. 21
 * API Name : 퀴즈 신고하기 API
 * [POST] /app/boards/{boardIdx}/quiz/{quizIdx}/report
 */
exports.postReportQuiz = async function (req, res) {

    const { boardIdx, quizIdx } = req.params;
    const userIdFromJWT = req.verifiedToken.userIdx;
    const { content, userIdx } = req.body;

    const quizWriterResult = await boardProvider.viewUserIdxByQuizIdx(quizIdx);
    const quizWriter = await Promise.all(quizWriterResult[0].map(async(val) => val.userIdx))
    const getQuizAfterReportResult = await boardProvider.viewQuizAfterReport(userIdx, boardIdx, quizIdx);

    if (!boardIdx) return res.send(errResponse(baseResponse.BOARD_BOARDIDX_EMPTY));
    if (!quizIdx) return res.send(errResponse(baseResponse.POINT_QUIZIDX_EXIST));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        if (!content) return res.send(errResponse(baseResponse.REPORT_CONTENT_EMPTY));
        if (quizWriter == userIdx) {
            return res.send(errResponse(baseResponse.REPORT_QUIZ_WRITER_SAME));
        } else {
            if (getQuizAfterReportResult[0].length > 0) {
                return res.send(errResponse(baseResponse.REPORT_QUIZ_NOT_OVER_TWICE_SAME));
            } else {
                const reportQuizResponse = await boardService.createReportQuiz( content, userIdx, boardIdx, quizIdx );
                return res.send(reportQuizResponse)
            }
        }
    }
}