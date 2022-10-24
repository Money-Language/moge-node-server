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

};

