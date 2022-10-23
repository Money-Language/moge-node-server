const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const { logger } = require('../../../config/winston');

const secret_config = require('../../../config/secret');
const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const axios = require('axios');
const jwt = require('jsonwebtoken');


/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
exports.getTest = async function (req, res) {
    return res.send(response(baseResponse.SUCCESS))
}


/**
 * API No. 1
 * API Name : 카카오 로그인
 * [POST] /app/users/login/kakao
 */
exports.loginKakao = async function (req, res) {
    const accessToken = req.body.accessToken;
    const name = req.body.nickname;
    try {
        let kakao_profile;
        try {
            kakao_profile = await axios.get('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
            });
        } catch (err) {
            logger.error(`Can't get kakao profile\n: ${JSON.stringify(err)}`);
            return res.send(errResponse(baseResponse.USER_ACCESS_TOKEN_WRONG));
        }

        const email = kakao_profile.data.kakao_account.email;
        const profileUrl = kakao_profile.data.kakao_account.profile.profile_image_url;
        const emailRows = await userProvider.emailCheck(email);

        // 이메일이 존재하는 경우 = 회원가입 되어 있는 경우 -> 로그인 처리
        if (emailRows.length > 0) {
            const userInfoRows = await userProvider.accountCheck(email);
            const token = await jwt.sign(
                {
                    userIdx: userInfoRows[0].userIdx,
                },
                secret_config.jwtsecret,
                {
                    expiresIn: '365d',
                    subject: 'userId',
                },
            );
            const result = { userIdx: userInfoRows[0].userIdx, jwt: token };
            return res.send(response(baseResponse.SUCCESS, result));

        // 이메일이 존재하지 않는 경우 -> 회원가입 처리
        } else {
            if(!name) return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY))
            const signUpResponse = await userService.createSocialUser(email, name, profileUrl, 'KAKAO');
            return res.send(signUpResponse);
        }
    } catch (err) {
        logger.error(`App - logInKakao Query error\n: ${JSON.stringify(err)}`);
        return res.send(errResponse(baseResponse.USER_INFO_EMPTY));
    }
};



/**
 * API No. 2
 * API Name : 네이버 로그인
 * [POST] /app/users/login/naver
 */
exports.loginNaver = async function (req, res) {
    const accessToken = req.body.accessToken;
    const name = req.body.nickname;
    try {
        let naver_profile;
        try {
            naver_profile = await axios.get('https://openapi.naver.com/v1/nid/me', {
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
            });
        } catch (err) {
            logger.error(`Can't get naver profile\n: ${JSON.stringify(err)}`);
            return res.send(errResponse(baseResponse.USER_ACCESS_TOKEN_WRONG));
        }

        const email = naver_profile.data.response.email;
        const profileUrl = naver_profile.data.response.profile_image;
        const emailRows = await userProvider.emailCheck(email);

        // 이메일이 존재하는 경우 = 회원가입 되어 있는 경우 -> 로그인 처리
        if (emailRows.length > 0) {
            const userInfoRows = await userProvider.accountCheck(email);
            const token = await jwt.sign(
                {
                    userIdx: userInfoRows[0].userIdx,
                },
                secret_config.jwtsecret,
                {
                    expiresIn: '365d',
                    subject: 'userId',
                },
            );
            const result = { userIdx: userInfoRows[0].userIdx, jwt: token };
            return res.send(response(baseResponse.SUCCESS, result));

        // 이메일이 존재하지 않는 경우 -> 회원가입 처리
        } else {
            if(!name) return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY))
            const signUpResponse = await userService.createSocialUser(email, name, profileUrl, 'NAVER');
            return res.send(signUpResponse);
        }
    } catch (err) {
        logger.error(`App - logInNaver Query error\n: ${JSON.stringify(err)}`);
        return res.send(errResponse(baseResponse.USER_INFO_EMPTY));
    }
};