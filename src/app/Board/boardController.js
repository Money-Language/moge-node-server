const jwtMiddleware = require("../../../config/jwtMiddleware");
const boardProvider = require("../../app/Board/boardProvider");
const boardService = require("../../app/Board/boardService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const { logger } = require('../../../config/winston');

const secret_config = require('../../../config/secret');
const {emit} = require("nodemon");
const jwt = require('jsonwebtoken');



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
            const feedByCategoryIdx = await boardProvider.viewFeedByCategoryIdx(categoryIdx);
            return res.send(response(baseResponse.SUCCESS, [categoryTitleResult[0], feedByCategoryIdx]));
        }
    }
};



/**
 * API No. 6
 * API Name : 각 게시글(피드) 별로 퀴즈 문제들 조회 ( + 답안도 조회 )
 * [GET] /app/boards/{boardIdx}/quiz
 */
exports.getQuizByBoardIdx = async function (req, res) {
    /**
     * Path Parameter : boardIdx
     * Query String : quizIdx
     */
    const boardIdx = req.params.boardIdx;
    const quizIdx = req.query.quizIdx
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