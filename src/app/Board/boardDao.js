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

// 각 카테고리 별로 게시글 조회
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
                                COUNT(distinct (case when e.status='ACTIVE' then e.boardLikeIdx end)) AS 'likeCount'
                        FROM User a
                        LEFT JOIN Board b on a.userIdx = b.userIdx
                        LEFT JOIN Quiz c on b.boardIdx = c.boardIdx
                        LEFT JOIN Category d on b.categoryIdx = d.categoryIdx
                        LEFT JOIN BoardLike e on b.boardIdx = e.boardIdx
                        WHERE d.categoryIdx = ? AND b.status = 'ACTIVE'
                        GROUP BY b.boardIdx;
                `;
  const [categoryFeedRow] = await connection.query(selectCategoryFeedQuery, categoryIdx);
  return categoryFeedRow;
}

// 퀴즈 아이디로 퀴즈 타입 조회
async function selectQuizTypeByQuizIdx(connection, quizIdx) {
  const selectTypeQuizQuery = `
                  SELECT distinct quizType
                  FROM Quiz
                  WHERE quizIdx = ?;
                `;
  const [quizTypeRows] = await connection.query(selectTypeQuizQuery, quizIdx);
  return quizTypeRows;
}

// 각자 퀴즈 문제의 게시글 번호 조회
async function selectBoardIdxByQuizIdx(connection, quizIdx) {
  const selectBoardIdxByQuizIdxQuery = `
                    SELECT boardIdx
                    FROM Quiz
                    WHERE quizIdx = ?;
                `;
  const [selectBoardIdxByQuizIdxRows] = await connection.query(selectBoardIdxByQuizIdxQuery, quizIdx);
  return selectBoardIdxByQuizIdxRows;
}

// 각 게시글(피드) 별로 퀴즈 문제들 조회
async function selectBoardQuiz(connection, boardIdx) {
  const selectBoardQuizQuery = `
                  SELECT quizIdx, quizType, question
                  FROM Quiz
                  WHERE boardIdx = ?;
              `;
  const [selectBoardQuizRow] = await connection.query(selectBoardQuizQuery, boardIdx);
  return selectBoardQuizRow;
}

// 각 퀴즈 마다 정답 보기 조회
async function selectQuizAnswer(connection, boardIdx, quizIdx) {
  const selectQuizAnswerQuery = `
                    SELECT a.boardIdx, a.quizIdx,
                      IF (a.quizType = '객관식', (b.answerSelectIdx), (c.answerSelectIdx)) AS answerSelectIdx,
                      IF(c.hint IS NULL, 'OBJECTIVE', c.hint) AS subjectiveHint,
                      IF (a.quizType = '객관식', (b.answer), 'SECRET') AS answer
                    FROM Quiz a
                    LEFT JOIN ObjectiveAnswer b on a.quizIdx = b.quizIdx
                    LEFT JOIN SubjectiveAnswer c on a.quizIdx = c.quizIdx
                    WHERE a.boardIdx = ? AND a.quizIdx = ?;
              `;
  const [selectQuizAnswerRow] = await connection.query(selectQuizAnswerQuery, [boardIdx, quizIdx]);
  return selectQuizAnswerRow;
}

// 각 퀴즈 마다 정답 여부 조회 (객관식)
async function selectObjectiveQuizAnswerCorrect(connection, boardIdx, quizIdx, answerSelectIdx) {
  const selectQuizAnswerCorrectQuery = `
                    SELECT a.boardIdx, a.quizIdx, b.answerSelectIdx, b.answer,
                      IF(b.answerSelectIdx = '01', 'CORRECT', 'WRONG') AS answerCorrect
                    FROM Quiz a
                    LEFT JOIN ObjectiveAnswer b on a.quizIdx = b.quizIdx
                    WHERE a.boardIdx = ? AND a.quizIdx = ? AND b.answerSelectIdx = ?;
              `;
  const [selectObjectiveQuizAnswerCorrectRow] = await connection.query(selectQuizAnswerCorrectQuery, [boardIdx, quizIdx, answerSelectIdx]);
  return selectObjectiveQuizAnswerCorrectRow;
}

// 각 퀴즈 마다 정답 여부 조회 (주관식)
async function selectSubjectiveQuizAnswerCorrect(connection, boardIdx, quizIdx, answerSelectIdx) {
  const selectQuizAnswerCorrectQuery = `
                      SELECT a.boardIdx, a.quizIdx, b.answerSelectIdx, b.answer
                      FROM Quiz a
                      LEFT JOIN SubjectiveAnswer b on a.quizIdx = b.quizIdx
                      WHERE a.boardIdx = ? AND a.quizIdx = ? AND b.answerSelectIdx = ?;
              `;
  const [selectSubjectiveQuizAnswerCorrectRow] = await connection.query(selectQuizAnswerCorrectQuery, [boardIdx, quizIdx, answerSelectIdx]);
  return selectSubjectiveQuizAnswerCorrectRow;
}

// 퀴즈 완료 후 유저 포인트 획득 (객관식)
async function userPointAfterObjectiveQuiz(connection, quizIdx, userIdx) {
  const userPointAfterObjectiveQuizQuery = `
                        UPDATE User a
                        LEFT JOIN Quiz b ON b.quizIdx = ?
                        LEFT JOIN ObjectiveAnswer c on b.quizIdx = c.quizIdx
                        SET a.userPoint = a.userPoint + 10
                        WHERE a.userIdx = ? AND c.answerSelectIdx ='01';
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
                        WHERE a.userIdx = ? AND c.answerSelectIdx ='01';
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
async function createObjectiveAnswer(connection, answer, answerSelectIdx, quizIdx) {
  const objectAnswerQuery = `
      INSERT INTO ObjectiveAnswer(answer, answerSelectIdx, quizIdx)
      VALUES (?, ?, ?);
  `;
  const [createObjectAnswerRows] = await connection.query(objectAnswerQuery, [answer, answerSelectIdx, quizIdx]);
  return createObjectAnswerRows;
}

// 주관식 정답 등록
async function createSubjectiveAnswer(connection, hint, answerSelectIdx, answer, quizIdx) {
  const subjectAnswerQuery = `
      INSERT INTO SubjectiveAnswer(hint, answerSelectIdx, answer, quizIdx)
      VALUES (?, ?, ?, ?);
  `;
  const [createSubjectAnswerRows] = await connection.query(subjectAnswerQuery, [hint, answerSelectIdx, answer, quizIdx]);
  return createSubjectAnswerRows;
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
  selectQuiz,
  selectQuizTypeByQuizIdx,
  selectBoardIdxByQuizIdx,
  selectBoardQuiz,
  selectQuizAnswer,
  selectObjectiveQuizAnswerCorrect,
  selectSubjectiveQuizAnswerCorrect,
  userPointAfterObjectiveQuiz,
  userPointAfterSubjectiveQuiz,
  selectUserIdxByQuizIdx,
  createBoard,
  createQuiz,
  createObjectiveAnswer,
  createSubjectiveAnswer
  };