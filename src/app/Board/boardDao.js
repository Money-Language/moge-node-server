// 각 유저가 작성한 게시글(피드) 조회
async function selectUserFeed(connection, userIdx) {
  const selectUserFeedQuery = `
                    SELECT d.categoryName,
                            b.title,
                            COUNT(distinct c.quizIdx) AS 'quizCount',
                            b.viewCount,
                            COUNT(distinct (case when e.status='ACTIVE' then e.boardLikeIdx end)) AS 'likeCount'
                    FROM User a
                    LEFT JOIN Board b on a.userIdx = b.userIdx
                    LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                    LEFT JOIN Category d on b.categoryIdx = d.categoryIdx
                    LEFT JOIN BoardLike e on b.boardIdx = e.boardIdx
                    WHERE a.userIdx = ?
                    GROUP BY b.boardIdx;
                `;
  const [userFeedRow] = await connection.query(selectUserFeedQuery, userIdx);
  return userFeedRow;
}

// 카테고리별로 각 유저가 작성한 게시글(피드) 조회
async function selectUserCategoryFeed(connection, userIdx, categoryName) {
  const selectUserCategoryFeedQuery = `
                    SELECT d.categoryName,
                            b.title,
                            COUNT(distinct c.quizIdx) AS 'quizCount',
                            b.viewCount,
                            COUNT(distinct (case when e.status='ACTIVE' then e.boardLikeIdx end)) AS 'likeCount'
                    FROM User a
                    LEFT JOIN Board b on a.userIdx = b.userIdx
                    LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                    LEFT JOIN Category d on b.categoryIdx = d.categoryIdx
                    LEFT JOIN BoardLike e on b.boardIdx = e.boardIdx
                    WHERE a.userIdx = ? AND d.categoryName = ?
                    GROUP BY b.boardIdx;
                `;
  const [userCategoryFeedRow] = await connection.query(selectUserCategoryFeedQuery, [userIdx, categoryName]);
  return userCategoryFeedRow;
}

// 모든 게시글 조회
async function selectBoard(connection) {
  const selectBoardQuery = `
                  SELECT *
                  FROM Board;
                `;
  const [boardRows] = await connection.query(selectBoardQuery);
  return boardRows;
}

// 모든 카테고리 조회
async function selectCategory(connection) {
  const selectCategoryQuery = `
                  SELECT *
                  FROM Category;
                `;
  const [categoryRows] = await connection.query(selectCategoryQuery);
  return categoryRows;
}

// 유저가 선택한 카테고리 조회
async function selectUserCategory(connection, userIdx) {
  const selectUserCategoryQuery = `
                  SELECT b.categoryName, a.categoryIdx
                  FROM UserCategory a
                  LEFT JOIN Category b ON a.categoryIdx = b.categoryIdx
                  WHERE a.userIdx = ?;
                `;
  const [userCategoryRows] = await connection.query(selectUserCategoryQuery, userIdx);
  return userCategoryRows;
}

// 게시글 조회수 증가 쿼리
async function updateViewCount(connection, boardIdx) {
  const updateViewCountQuery = `
      UPDATE Board
      SET viewCount = viewCount + 1
      WHERE boardIdx = ?;
    `;
  const updateViewCountRow = await connection.query(updateViewCountQuery, boardIdx);
  return updateViewCountRow;
}

// 각 카테고리 제목, 서브 제목 수집
async function categoryTitleInfo(connection, categoryIdx) {
  const selectCategoryTitleQuery = `
            SELECT categoryName, categorySubName
            FROM Category
            WHERE categoryIdx = ?;
        `;
  const selectCategoryRow = await connection.query(selectCategoryTitleQuery, categoryIdx);
  return selectCategoryRow;
}

// 각 카테고리 별로 게시글 조회
async function selectCategoryFeed(connection, categoryIdx) {
  const selectCategoryFeedQuery = `
                        SELECT a.nickname,
                                a.profileImage,
                                CASE
                                  WHEN TIMESTAMPDIFF(MINUTE, b.createdAt, NOW()) <= 0 THEN '방금 전'
                                  WHEN TIMESTAMPDIFF(MINUTE, b.createdAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, b.createdAt, NOW()), '분 전')
                                  WHEN TIMESTAMPDIFF(HOUR, b.createdAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, b.createdAt, NOW()), '시간 전')
                                  WHEN TIMESTAMPDIFF(DAY, b.createdAt, NOW()) < 7 THEN CONCAT(TIMESTAMPDIFF(DAY, b.createdAt, NOW()), '일 전')
                                  WHEN TIMESTAMPDIFF(WEEK, b.createdAt, NOW()) < 5 THEN CONCAT(TIMESTAMPDIFF(WEEK, b.createdAt, NOW()), '주 전')
                                  ELSE CONCAT(TIMESTAMPDIFF(MONTH, b.createdAt, NOW()), '달 전')
                                END AS 'elapsedTime',
                                b.title,
                                COUNT(distinct c.quizIdx) AS 'quizCount',
                                b.viewCount,
                                COUNT(distinct (case when e.status='ACTIVE' then e.boardLikeIdx end)) AS 'likeCount'
                        FROM User a
                        LEFT JOIN Board b on a.userIdx = b.userIdx
                        LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                        LEFT JOIN Category d on b.categoryIdx = d.categoryIdx
                        LEFT JOIN BoardLike e on b.boardIdx = e.boardIdx
                        WHERE d.categoryIdx = ?
                        GROUP BY b.boardIdx;
                `;
  const [categoryFeedRow] = await connection.query(selectCategoryFeedQuery, categoryIdx);
  return categoryFeedRow;
}


// 각 게시글(피드) 별로 퀴즈 문제들 조회



module.exports = { 
  selectUserFeed,
  selectUserCategoryFeed,
  selectBoard,
  selectCategory,
  selectUserCategory,
  updateViewCount,
  categoryTitleInfo,
  selectCategoryFeed,
  };