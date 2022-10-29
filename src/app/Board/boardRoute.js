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
    app.get('/app/boards/category-name/:categoryIdx', board.getCategoryTitleBycategoryIdx);

    // 7. 각 게시글 별로 퀴즈 문제들 조회 ( + 퀴즈의 답안 조회 )
    app.get('/app/boards/:boardIdx/quiz', board.getQuizByBoardIdx);

    // 8. 게시글 등록 ( + 퀴즈 등록 병행 )
    app.post('/app/users/:userIdx/boards', jwtMiddleware, board.postBoardQuiz);

};

