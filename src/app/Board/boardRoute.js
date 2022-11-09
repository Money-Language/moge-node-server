const { application } = require('express');

module.exports = function(app){
    const board = require('./boardController');
    const secret_config = require('../../../config/secret')
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 3. 각 유저가 작성한 게시글(피드) 조회
    app.get('/app/users/:userIdx/boards', jwtMiddleware, board.getBoardListByIdx);

    // 4. 게시글 조회수 증가
    app.post('/app/boards/:boardIdx/view-count', board.increaseViewCount);

    // 5. 각 카테고리 별로 게시글 조회 
    app.get('/app/boards/:categoryIdx', board.getBoardListBycategoryIdx);

    // 6. 각 카테고리 별로 카테고리 이름, 서브타이틀 조회
    app.get('/app/boards/:categoryIdx/category-name', board.getCategoryTitleBycategoryIdx);

    // 7. 각 게시글 별로 퀴즈 문제들 조회 ( + 퀴즈의 답안 조회 )
    app.get('/app/boards/:boardIdx/quiz', board.getQuizByBoardIdx);

    // 8. 퀴즈 완료 후 유저 포인트 획득 API
    app.post('/app/users/:userIdx/get-points', jwtMiddleware, board.increaseUserPoint);

    // 9. 게시글 등록
    app.post('/app/users/:userIdx/boards', jwtMiddleware, board.postBoard);

    // 10. 퀴즈 등록
    app.post('/app/users/:userIdx/quiz', jwtMiddleware, board.postQuiz);

    // 11. 정답 등록
    app.post('/app/users/:userIdx/answer', jwtMiddleware, board.postAnswer);

    // 15. 사용자 오답 적재
    app.post('/app/users/:userIdx/wrong-answer', jwtMiddleware, board.postWrongAnswer);

    // 16. 맞춘 오답 삭제
    app.delete('/app/users/:userIdx/wrong-answer', jwtMiddleware, board.deleteWrongAnswer);

    // 17. 오답이 있는 날짜 조회
    app.get('/app/users/:userIdx/wrong-answer/date', jwtMiddleware, board.getWrongAnswerDate);

    // 18. 오답 복습 퀴즈 문제 조회
    app.get('/app/users/:userIdx/wrong-answer', jwtMiddleware, board.getWrongAnswerQuiz);

    // 19. 오답 복습 퀴즈 정답 보기 조회
    app.get('/app/users/:userIdx/wrong-answer/:quizIdx', jwtMiddleware, board.getWrongAnswerContents);

};

