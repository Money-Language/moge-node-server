module.exports = function(app){
    const user = require('./userController');
    const passport = require('passport');
    const secret_config = require('../../../config/secret')
    const KakaoStrategy = require('passport-kakao').Strategy;
    const session = require('express-session');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.use(session({secret: 'SECRET_CODE', resave: true, saveUninitialized: false}));
    app.use(passport.initialize());
    app.use(passport.session());

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
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user); 
    });

    // 0. 테스트 API
    app.get('/test', user.getTest)

    // 1. 카카오 소셜 로그인 API
    app.post('/users/login/kakao', user.loginKakao);
    // 1-1. 카카오 Access 토큰 발급 Url
    app.get('/auth/kakao/callback', passport.authenticate('kakao-login', { failureRedirect: '/auth', successRedirect: '/' }));

};

