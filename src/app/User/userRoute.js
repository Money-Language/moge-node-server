module.exports = function(app){
    const user = require('./userController');
    const passport = require('passport');
    const secret_config = require('../../../config/secret')
    const KakaoStrategy = require('passport-kakao').Strategy;
    const NaverStrategy = require('passport-naver').Strategy;
    const session = require('express-session');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.use(session({secret: 'SECRET_CODE', resave: true, saveUninitialized: false}));
    app.use(passport.initialize());
    app.use(passport.session());

    // 카카오 passport 로직
    passport.use(
        'kakao-login',
        new KakaoStrategy(
            {
                clientID: secret_config.clientID,
                clientSecret: secret_config.clientSecret,
                callbackURL: secret_config.callbackURL,
            },
            function (accessToken, refreshToken, profile, done) {
                result = {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    profile: profile,
                };
                console.log('KakaoStrategy', result);
                return done;
            },
        ),
    );
    
    // 네이버 possport 로직
    passport.use(
        'naver-login',
        new NaverStrategy(
            {
                clientID: secret_config.naverClientID,
                clientSecret: secret_config.naverClientSecret,
                callbackURL: secret_config.naverCallbackURL
            },
            function (accessToken, refreshToken, profile, done) {
                result = {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    profile: profile,
                };
                console.log('NaverStrategy', result);
                return done;
            },
        )
    );

    // 로그인 성공시 사용자 정보를 Session에 저장한다.
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    // 인증 후, 페이지 접근시 마다 사용자 정보를 Session에서 읽어온다.
    passport.deserializeUser((user, done) => {
        done(null, user); 
    });


    // 0. 테스트 API
    app.get('/app/test', user.getTest)

    // 1. 카카오 소셜 로그인 API
    app.post('/app/users/login/kakao', user.loginKakao);
    // 1-1. 카카오 Access 토큰 발급 Url
    app.get('/auth/kakao/callback', passport.authenticate('kakao-login', { failureRedirect: '/auth', successRedirect: '/' }));

    // 2. 네이버 소셜 로그인 API
    app.post('/app/users/login/naver', user.loginNaver);
    // 2-1. 네이버 Access 토큰 발급 Url
    app.get('/auth/naver/callback', passport.authenticate('naver-login', { failureRedirect: '/auth', successRedirect: '/' }));

    // 3. 각 유저가 작성한 게시글(피드) 조회
    app.get('/app/users/:userIdx/boards', user.getBoardListByIdx);

};

