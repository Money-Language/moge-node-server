// 각 유저가 작성한 게시글(피드) 조회
async function selectUserFeed(connection, userIdx) {
  const selectUserFeedQuery = `
                    SELECT  b.boardIdx,
                            d.categoryName,
                            b.title,
                            COUNT(distinct c.quizIdx) AS 'quizCount',
                            b.viewCount,
                            COUNT(distinct (case when e.status='ACTIVE' then e.boardLikeIdx end)) AS 'likeCount',
                            COUNT(distinct (case when f.status='ACTIVE' then f.commentIdx end)) AS 'commentCount'
                    FROM User a
                    LEFT JOIN Board b on a.userIdx = b.userIdx
                    LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                    LEFT JOIN Category d on b.categoryIdx = d.categoryIdx
                    LEFT JOIN BoardLike e on b.boardIdx = e.boardIdx
                    LEFT JOIN Comment f on b.boardIdx = f.boardIdx
                    WHERE a.userIdx = ? AND b.status = 'ACTIVE'
                    GROUP BY b.boardIdx;
                `;
  const [userFeedRow] = await connection.query(selectUserFeedQuery, userIdx);
  return userFeedRow;
}

// 카테고리별로 각 유저가 작성한 게시글(피드) 조회
async function selectUserCategoryFeed(connection, userIdx, categoryName) {
  const selectUserCategoryFeedQuery = `
                    SELECT  b.boardIdx,
                            d.categoryName,
                            b.title,
                            COUNT(distinct c.quizIdx) AS 'quizCount',
                            b.viewCount,
                            COUNT(distinct (case when e.status='ACTIVE' then e.boardLikeIdx end)) AS 'likeCount',
                            COUNT(distinct (case when f.status='ACTIVE' then f.commentIdx end)) AS 'commentCount'
                    FROM User a
                    LEFT JOIN Board b on a.userIdx = b.userIdx
                    LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                    LEFT JOIN Category d on b.categoryIdx = d.categoryIdx
                    LEFT JOIN BoardLike e on b.boardIdx = e.boardIdx
                    LEFT JOIN Comment f on b.boardIdx = f.boardIdx
                    WHERE a.userIdx = ? AND d.categoryName = ? AND b.status = 'ACTIVE'
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

// 모든 퀴즈 조회
async function selectQuiz(connection) {
  const selectQuizQuery = `
                  SELECT *
                  FROM Quiz;
                `;
  const [quizRows] = await connection.query(selectQuizQuery);
  return quizRows;
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

// 각 카테고리 별로 게시글 조회 - 최신순
async function selectCategoryFeed(connection, categoryIdx) {
  const selectCategoryFeedQuery = `
                        SELECT  b.boardIdx,
                                a.nickname,
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
                                COUNT(distinct (case when e.status='ACTIVE' then e.boardLikeIdx end)) AS 'likeCount',
                                COUNT(distinct (case when f.status='ACTIVE' then f.commentIdx end)) AS 'commentCount'
                        FROM User a
                        LEFT JOIN Board b on a.userIdx = b.userIdx
                        LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                        LEFT JOIN Category d on b.categoryIdx = d.categoryIdx
                        LEFT JOIN BoardLike e on b.boardIdx = e.boardIdx
                        LEFT JOIN Comment f on b.boardIdx = f.boardIdx
                        WHERE d.categoryIdx = ? AND b.status = 'ACTIVE'
                        GROUP BY b.boardIdx
                        ORDER BY elapsedTime ASC;
                `;
  const [categoryFeedRow] = await connection.query(selectCategoryFeedQuery, categoryIdx);
  return categoryFeedRow;
}

// 각 카테고리 별로 게시글 조회 - 조회순
async function selectCategoryFeedOrderView(connection, categoryIdx) {
  const selectCategoryFeedOrderViewQuery = `
                        SELECT  b.boardIdx,
                                a.nickname,
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
                                COUNT(distinct (case when e.status='ACTIVE' then e.boardLikeIdx end)) AS 'likeCount',
                                COUNT(distinct (case when f.status='ACTIVE' then f.commentIdx end)) AS 'commentCount'
                        FROM User a
                        LEFT JOIN Board b on a.userIdx = b.userIdx
                        LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                        LEFT JOIN Category d on b.categoryIdx = d.categoryIdx
                        LEFT JOIN BoardLike e on b.boardIdx = e.boardIdx
                        LEFT JOIN Comment f on b.boardIdx = f.boardIdx
                        WHERE d.categoryIdx = ? AND b.status = 'ACTIVE'
                        GROUP BY b.boardIdx, b.viewCount
                        ORDER BY b.viewCount DESC;
                `;
  const [categoryFeedOrderViewRow] = await connection.query(selectCategoryFeedOrderViewQuery, categoryIdx);
  return categoryFeedOrderViewRow;
}

// 각 카테고리 별로 게시글 조회 - 인기순
async function selectCategoryFeedOrderLike(connection, categoryIdx) {
  const selectCategoryFeedOrderLikeQuery = `
                        SELECT  b.boardIdx,
                                a.nickname,
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
                                COUNT(distinct (case when e.status='ACTIVE' then e.boardLikeIdx end)) AS 'likeCount',
                                COUNT(distinct (case when f.status='ACTIVE' then f.commentIdx end)) AS 'commentCount'
                        FROM User a
                        LEFT JOIN Board b on a.userIdx = b.userIdx
                        LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                        LEFT JOIN Category d on b.categoryIdx = d.categoryIdx
                        LEFT JOIN BoardLike e on b.boardIdx = e.boardIdx
                        LEFT JOIN Comment f on b.boardIdx = f.boardIdx
                        WHERE d.categoryIdx = ? AND b.status = 'ACTIVE'
                        GROUP BY b.boardIdx
                        ORDER BY likeCount DESC;
                `;
  const [categoryFeedOrderLikeRow] = await connection.query(selectCategoryFeedOrderLikeQuery, categoryIdx);
  return categoryFeedOrderLikeRow;
}

// 퀴즈 아이디로 퀴즈 타입 조회
async function selectQuizTypeByQuizIdx(connection, quizIdx) {
  const selectTypeQuizQuery = `
                  SELECT distinct quizType
                  FROM Quiz
                  WHERE quizIdx = ? AND status = 'ACTIVE';
                `;
  const [quizTypeRows] = await connection.query(selectTypeQuizQuery, quizIdx);
  return quizTypeRows;
}

// 각자 퀴즈 문제의 게시글 번호 조회
async function selectBoardIdxByQuizIdx(connection, quizIdx) {
  const selectBoardIdxByQuizIdxQuery = `
                    SELECT boardIdx
                    FROM Quiz
                    WHERE quizIdx = ? AND status = 'ACTIVE';
                `;
  const [selectBoardIdxByQuizIdxRows] = await connection.query(selectBoardIdxByQuizIdxQuery, quizIdx);
  return selectBoardIdxByQuizIdxRows;
}

// 각 게시글(피드) 별로 퀴즈 문제들 조회
async function selectBoardQuiz(connection, boardIdx) {
  const selectBoardQuizQuery = `
                  SELECT quizIdx, quizType, question
                  FROM Quiz
                  WHERE boardIdx = ? AND status = 'ACTIVE';
              `;
  const [selectBoardQuizRow] = await connection.query(selectBoardQuizQuery, boardIdx);
  return selectBoardQuizRow;
}

// 각 퀴즈 마다 정답 보기 조회
async function selectQuizAnswer(connection, boardIdx, quizIdx) {
  const selectQuizAnswerQuery = `
                      SELECT a.quizIdx,
                        IF (a.quizType = 1, (b.content), (c.content)) AS content,
                        IF (a.quizType = 1, (b.isAnswer), (c.isAnswer)) AS isAnswer,
                        IF (a.quizType = 1, 'OBJECTIVE', c.hint) AS hint
                      FROM Quiz a
                      LEFT JOIN ObjectiveAnswer b on a.quizIdx = b.quizIdx
                      LEFT JOIN SubjectiveAnswer c on a.quizIdx = c.quizIdx
                      WHERE a.boardIdx = ? AND a.quizIdx = ? AND a.status = 'ACTIVE';
              `;
  const [selectQuizAnswerRow] = await connection.query(selectQuizAnswerQuery, [boardIdx, quizIdx]);
  return selectQuizAnswerRow;
}

// 퀴즈 완료 후 유저 포인트 획득 (객관식)
async function userPointAfterObjectiveQuiz(connection, quizIdx, userIdx) {
  const userPointAfterObjectiveQuizQuery = `
                        UPDATE User a
                        LEFT JOIN Quiz b ON b.quizIdx = ?
                        LEFT JOIN ObjectiveAnswer c on b.quizIdx = c.quizIdx
                        SET a.userPoint = a.userPoint + 10
                        WHERE a.userIdx = ? AND c.isAnswer = 1 AND b.status = 'ACTIVE';
                `;
  const userPointAfterObjectiveQuizRow = await connection.query(userPointAfterObjectiveQuizQuery, [quizIdx, userIdx]);
  return userPointAfterObjectiveQuizRow;
}

// 퀴즈 완료 후 유저 포인트 획득 (주관식)
async function userPointAfterSubjectiveQuiz(connection, quizIdx, userIdx) {
  const userPointAfterSubjectiveQuizQuery = `
                        UPDATE User a
                        LEFT JOIN Quiz b ON b.quizIdx = ?
                        LEFT JOIN SubjectiveAnswer c on b.quizIdx = c.quizIdx
                        SET a.userPoint = a.userPoint + 10
                        WHERE a.userIdx = ? AND c.isAnswer = 1 AND b.status = 'ACTIVE';
                `;
  const userPointAfterSubjectiveQuizRow = await connection.query(userPointAfterSubjectiveQuizQuery, [quizIdx, userIdx]);
  return userPointAfterSubjectiveQuizRow;
}

// 퀴즈를 출제한 사용자 인덱스 조회
async function selectUserIdxByQuizIdx(connection, quizIdx) {
  const selectUserIdxByQuizIdxQuery = `
                        SELECT a.userIdx
                        FROM User a
                        LEFT JOIN Board b ON a.userIdx = b.userIdx
                        LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                        WHERE c.quizIdx = ?;
                  `;
  const selectUserIdxByQuizIdxRow = await connection.query(selectUserIdxByQuizIdxQuery, quizIdx);
  return selectUserIdxByQuizIdxRow;
}

// 게시글 인덱스를 통해 카테고리 인덱스 조회
async function selectCategoryIdxByBoardIdx(connection, boardIdx) {
  const selectCategoryIdxByBoardIdxQuery = `
                        SELECT categoryIdx
                        FROM Board
                        WHERE boardIdx = ?;
                  `;
  const selectCategoryIdxByBoardIdxRow = await connection.query(selectCategoryIdxByBoardIdxQuery, boardIdx);
  return selectCategoryIdxByBoardIdxRow;
}

// 게시글 등록
async function createBoard(connection, title, userIdx, categoryIdx) {
  const boardQuery = `
      INSERT INTO Board(title, userIdx, categoryIdx)
      VALUES (?, ?, ?);
  `;
  const [createBoardRows] = await connection.query(boardQuery, [title, userIdx, categoryIdx]);
  return createBoardRows;
}

// 퀴즈 등록
async function createQuiz(connection, question, quizType, boardIdx) {
  const quizQuery = `
      INSERT INTO Quiz(question, quizType, boardIdx)
      VALUES (?, ?, ?);
  `;
  const [createQuizRows] = await connection.query(quizQuery, [question, quizType, boardIdx]);
  return createQuizRows;
}

// 객관식 정답 등록
async function createObjectiveAnswer(connection, content, isAnswer, quizIdx) {
  const objectAnswerQuery = `
      INSERT INTO ObjectiveAnswer(content, isAnswer, quizIdx)
      VALUES (?, ?, ?);
  `;
  const [createObjectAnswerRows] = await connection.query(objectAnswerQuery, [content, isAnswer, quizIdx]);
  return createObjectAnswerRows;
}

// 주관식 정답 등록
async function createSubjectiveAnswer(connection, hint, content, isAnswer, quizIdx) {
  const subjectAnswerQuery = `
      INSERT INTO SubjectiveAnswer(hint, content, isAnswer, quizIdx)
      VALUES (?, ?, ?, ?);
  `;
  const [createSubjectAnswerRows] = await connection.query(subjectAnswerQuery, [hint, content, isAnswer, quizIdx]);
  return createSubjectAnswerRows;
}

// 퀴즈 풀 때 틀린 답 적재
async function stackWrongAnswer(connection, userIdx, categoryIdx, boardIdx, quizIdx) {
  const stackWrongAnswerQuery = `
      INSERT INTO WrongAnswer(userIdx, categoryIdx, boardIdx, quizIdx)
      VALUES (?, ?, ?, ?);
  `;
  const [stackWrongAnswerRows] = await connection.query(stackWrongAnswerQuery, [userIdx, categoryIdx, boardIdx, quizIdx]);
  return stackWrongAnswerRows;
}

// 맞춘 오답 삭제
async function deleteWrongAnswer(connection, userIdx, quizIdx) {
  const deleteWrongAnswerQuery = `
      UPDATE WrongAnswer
      SET status = 'DELETE'
      WHERE userIdx = ? AND quizIdx = ?;
  `;
  const [deleteWrongAnswerRows] = await connection.query(deleteWrongAnswerQuery, [userIdx, quizIdx]);
  return deleteWrongAnswerRows;
}

// 오답이 있는 날짜 조회
async function selectWrongAnswerDate(connection, userIdx) {
  const selectWrongAnswerDateQuery = `
                                SELECT DATE_FORMAT(createdAt, '%y.%m.%d') AS date
                                FROM WrongAnswer
                                WHERE userIdx = ? AND status = 'ACTIVE' AND DATE_FORMAT(createdAt, '%y.%m.%d') != DATE_FORMAT(NOW(), '%y.%m.%d');
                          `;
  const selectWrongAnswerDateRow = await connection.query(selectWrongAnswerDateQuery, userIdx);
  return selectWrongAnswerDateRow;
}

// 날짜에 따른 오답 조회
async function selectWrongAnswerByDate(connection, userIdx, date) {
  const selectWrongAnswerByDateQuery = `
                                SELECT categoryIdx, boardIdx, quizIdx
                                FROM WrongAnswer
                                WHERE userIdx = ? AND status = 'ACTIVE' AND DATE_FORMAT(createdAt, '%y.%m.%d') = DATE_FORMAT( ?, '%y.%m.%d' );
                          `;
  const selectWrongAnswerByDateRow = await connection.query(selectWrongAnswerByDateQuery, [userIdx, date]);
  return selectWrongAnswerByDateRow;
}

// 오답 복습 퀴즈 문제 전체 조회
async function selectWrongAnswerWholeQuiz(connection, userIdx) {
  const selectWrongAnswerQuizQuery = `
                                  SELECT b.quizIdx, b.quizType, b.question
                                  FROM WrongAnswer a
                                  LEFT JOIN Quiz b on a.quizIdx = b.quizIdx
                                  WHERE a.userIdx = ? AND a.status = 'ACTIVE';
                          `;
  const selectWrongAnswerQuizRow = await connection.query(selectWrongAnswerQuizQuery, userIdx);
  return selectWrongAnswerQuizRow;
}

// 오답 복습 퀴즈 문제 냩개 조회
async function selectWrongAnswerElementQuiz(connection, userIdx, quizIdx) {
  const selectWrongAnswerQuizQuery = `
                                  SELECT b.quizIdx, b.quizType, b.question
                                  FROM WrongAnswer a
                                  LEFT JOIN Quiz b on a.quizIdx = b.quizIdx
                                  WHERE a.userIdx = ? AND a.quizIdx = ? AND a.status = 'ACTIVE';
                          `;
  const selectWrongAnswerQuizRow = await connection.query(selectWrongAnswerQuizQuery, [userIdx, quizIdx]);
  return selectWrongAnswerQuizRow;
}

// 오답 복습 퀴즈 정답 조회
async function selectWrongAnswerContents(connection, userIdx, quizIdx) {
  const selectWrongQuizAnswerQuery = `
                                SELECT a.quizIdx,
                                IF (b.quizType = 1, (c.content), (d.content)) AS content,
                                IF (b.quizType = 1, (c.isAnswer), (d.isAnswer)) AS isAnswer,
                                IF (b.quizType = 1, 'OBJECTIVE', d.hint) AS hint
                                FROM WrongAnswer a
                                LEFT JOIN Quiz b on b.quizIdx = a.quizIdx
                                LEFT JOIN ObjectiveAnswer c on b.quizIdx = c.quizIdx
                                LEFT JOIN SubjectiveAnswer d on b.quizIdx = d.quizIdx
                                WHERE a.userIdx = ? AND a.quizIdx = ? AND a.status = 'ACTIVE';
                          `;
  const selectWrongQuizAnswerRow = await connection.query(selectWrongQuizAnswerQuery, [userIdx, quizIdx]);
  return selectWrongQuizAnswerRow;
}

// 게시글 신고하기
async function createReportBoard(connection, content, userIdx, boardIdx) {
  const createReportBoardQuery = `
      INSERT INTO Report(content, userIdx, boardIdx)
      VALUES (?, ?, ?);
  `;
  const [createReportBoardRows] = await connection.query(createReportBoardQuery, [content, userIdx, boardIdx]);
  return createReportBoardRows;
}

// 게시글 신고 3회 이상이면 비활성화 설정
async function updateBoardByReport(connection, boardIdx) {
  const updateBoardByReportQuery = `
            UPDATE Board a
            LEFT JOIN Report b ON a.boardIdx = b.boardIdx
            SET a.status = 'INACTIVE'
            WHERE a.boardIdx = ? AND (SELECT COUNT(*) FROM Report WHERE commentIdx = null AND quizIdx = null GROUP BY boardIdx) > 3;
  `;
  const [updateBoardByReportRows] = await connection.query(updateBoardByReportQuery, boardIdx);
  return updateBoardByReportRows;
}

// 게시글 작성한 사용자 인덱스 조회
async function selectUserIdxByBoardIdx(connection, boardIdx) {
  const selectUserIdxByBoardIdxQuery = `
                        SELECT userIdx
                        FROM Board
                        WHERE boardIdx = ?;
                  `;
  const selectUserIdxByBoardIdxRow = await connection.query(selectUserIdxByBoardIdxQuery, boardIdx);
  return selectUserIdxByBoardIdxRow;
}

// 자기가 신고했던 게시글 조회
async function selectBoardAfterReport(connection, userIdx, boardIdx) {
  const selectBoardAfterReportQuery = `
                        SELECT reportIdx, content
                        FROM Report
                        WHERE userIdx = ? AND boardIdx = ?;
                  `;
  const selectBoardAfterReportRow = await connection.query(selectBoardAfterReportQuery, [userIdx, boardIdx]);
  return selectBoardAfterReportRow;
}

// 게시글 상태 체크
async function selectBoardStatus(connection, boardIdx) {
  const selectBoardStatusQuery = `
                        SELECT title, userIdx, status
                        FROM Board
                        WHERE boardIdx = ?;
                  `;
  const selectBoardStatusRow = await connection.query(selectBoardStatusQuery, boardIdx);
  return selectBoardStatusRow[0];
}

// 퀴즈 신고하기
async function createReportQuiz(connection, content, userIdx, boardIdx, quizIdx) {
  const createReportQuizQuery = `
      INSERT INTO Report(content, userIdx, boardIdx, quizIdx)
      VALUES (?, ?, ?, ?);
  `;
  const [createReportQuizRows] = await connection.query(createReportQuizQuery, [content, userIdx, boardIdx, quizIdx]);
  return createReportQuizRows;
}

// 퀴즈 신고 3회 이상이면 비활성화 설정
async function updateQuizByReport(connection, boardIdx, quizIdx) {
  const updateQuizByReportQuery = `
            UPDATE Quiz a
            LEFT JOIN Report b ON a.quizIdx = b.quizIdx
            SET a.status = 'INACTIVE'
            WHERE a.boardIdx = ? AND a.quizIdx = ? AND (SELECT COUNT(*) FROM Report WHERE commentIdx = null GROUP BY quizIdx) > 3;
  `;
  const [updateQuizByReportRows] = await connection.query(updateQuizByReportQuery, [boardIdx, quizIdx]);
  return updateQuizByReportRows;
}

// 자기가 신고했던 퀴즈 조회
async function selectQuizAfterReport(connection, userIdx, boardIdx, quizIdx) {
  const selectQuizAfterReportQuery = `
                        SELECT reportIdx, content
                        FROM Report
                        WHERE userIdx = ? AND boardIdx = ? AND quizIdx = ?;
                  `;
  const selectQuizAfterReportRow = await connection.query(selectQuizAfterReportQuery, [userIdx, boardIdx, quizIdx]);
  return selectQuizAfterReportRow;
}

// 퀴즈 상태 체크
async function selectQuizStatus(connection, quizIdx) {
  const selectQuizStatusQuery = `
                        SELECT question, quizType, boardIdx, status
                        FROM Quiz
                        WHERE quizIdx = ?;
                  `;
  const selectQuizStatusRow = await connection.query(selectQuizStatusQuery, quizIdx);
  return selectQuizStatusRow[0];
}

// 오늘의 퀴즈 문제 조회
async function selectDailyQuiz(connection, userIdx) {
  const selectDailyQuizQuery = `
                        SELECT a.quizIdx, a.quizType, a.question, a.boardIdx
                        FROM Quiz a
                        LEFT JOIN Board b ON a.boardIdx = b.boardIdx
                        WHERE a.status = 'ACTIVE' AND b.userIdx NOT LIKE CONCAT('%', ?, '%')
                        ORDER BY RAND()
                        LIMIT 1;
                  `;
  const selectDailyQuizRow = await connection.query(selectDailyQuizQuery, userIdx);
  return selectDailyQuizRow;
}



module.exports = { 
  selectUserFeed,
  selectUserCategoryFeed,
  selectBoard,
  selectCategory,
  selectUserCategory,
  updateViewCount,
  categoryTitleInfo,
  selectCategoryFeed,
  selectCategoryFeedOrderView,
  selectCategoryFeedOrderLike,
  selectQuiz,
  selectQuizTypeByQuizIdx,
  selectBoardIdxByQuizIdx,
  selectBoardQuiz,
  selectQuizAnswer,
  userPointAfterObjectiveQuiz,
  userPointAfterSubjectiveQuiz,
  selectUserIdxByQuizIdx,
  selectCategoryIdxByBoardIdx,
  createBoard,
  createQuiz,
  createObjectiveAnswer,
  createSubjectiveAnswer,
  stackWrongAnswer,
  deleteWrongAnswer,
  selectWrongAnswerDate,
  selectWrongAnswerByDate,
  selectWrongAnswerWholeQuiz,
  selectWrongAnswerElementQuiz,
  selectWrongAnswerContents,
  createReportBoard,
  updateBoardByReport,
  selectUserIdxByBoardIdx,
  selectBoardAfterReport,
  selectBoardStatus,
  createReportQuiz,
  updateQuizByReport,
  selectQuizAfterReport,
  selectQuizStatus,
  selectDailyQuiz
  };