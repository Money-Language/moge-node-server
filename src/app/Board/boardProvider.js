const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

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
        // 카테고리 이름 req가 없을 때
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