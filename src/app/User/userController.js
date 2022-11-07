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
 * API Name : 카카오 소셜 회원가입 API
 * [POST] /app/users/sign-up/kakao
 */
exports.signUpKakao = async function (req, res) {
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
        const socialCreatedID = kakao_profile.data.id;

        if (!accessToken) return res.send(errResponse(baseResponse.ACCESS_TOKEN_EMPTY))
        if (!name) return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY))
        const signUpResponse = await userService.createSocialUser(email, name, profileUrl, socialCreatedID, 'KAKAO');
        return res.send(signUpResponse);

    } catch (err) {
        logger.error(`App - signUpKakao Query error\n: ${JSON.stringify(err)}`);
        return res.send(errResponse(baseResponse.USER_INFO_EMPTY));
    }
};



/**
 * API No. 12
 * API Name : 카카오 로그인 API
 * [POST] /app/users/login/kakao
 */
exports.loginKakao = async function (req, res) {
    const accessToken = req.body.accessToken;
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

        const socialCreatedID = kakao_profile.data.id;
        const socialIDRows = await userProvider.socialCreatedIDCheck(socialCreatedID);

        if (socialIDRows.length > 0) {
            const userInfoRows = await userProvider.accountSocialCheck(socialCreatedID);
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
            if (!accessToken) return res.send(errResponse(baseResponse.ACCESS_TOKEN_EMPTY))
            const result = { userIdx: userInfoRows[0].userIdx, jwt: token };
            return res.send(response(baseResponse.SUCCESS, result));
        } else {
            return res.send(errResponse(baseResponse.USER_SOCIAL_ID_NOT_EXIST));
        }
    } catch (err) {
        logger.error(`App - loginKakao Query error\n: ${JSON.stringify(err)}`);
        return res.send(errResponse(baseResponse.USER_INFO_EMPTY));
    }
};



/**
 * API No. 2
 * API Name : 네이버 소셜 회원가입 API
 * [POST] /app/users/sign-up/naver
 */
exports.signUpNaver = async function (req, res) {
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
        const socialCreatedID = naver_profile.data.response.id;

        if (!accessToken) return res.send(errResponse(baseResponse.ACCESS_TOKEN_EMPTY))
        if (!name) return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY))
        const signUpResponse = await userService.createSocialUser(email, name, profileUrl, socialCreatedID, 'NAVER');
        return res.send(signUpResponse);

    } catch (err) {
        logger.error(`App - signUpNaver Query error\n: ${JSON.stringify(err)}`);
        return res.send(errResponse(baseResponse.USER_INFO_EMPTY));
    }
};



/**
 * API No. 13
 * API Name : 네이버 로그인 API
 * [POST] /app/users/login/naver
 */
exports.loginNaver = async function (req, res) {
    const accessToken = req.body.accessToken;
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

        const socialCreatedID = naver_profile.data.response.id;
        const socialIDRows = await userProvider.socialCreatedIDCheck(socialCreatedID);

        if (socialIDRows.length > 0) {
            const userInfoRows = await userProvider.accountSocialCheck(socialCreatedID);
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
            if (!accessToken) return res.send(errResponse(baseResponse.ACCESS_TOKEN_EMPTY))
            const result = { userIdx: userInfoRows[0].userIdx, jwt: token };
            return res.send(response(baseResponse.SUCCESS, result));
        } else {
            return res.send(errResponse(baseResponse.USER_SOCIAL_ID_NOT_EXIST));
        }
    } catch (err) {
        logger.error(`App - loginNaver Query error\n: ${JSON.stringify(err)}`);
        return res.send(errResponse(baseResponse.USER_INFO_EMPTY));
    }
};


/**
 * API No. 14
 * API Name : 각 유저마다 포인트 조회하는 API
 * [GET] /app/users/{userIdx}/points
 */
exports.viewUserPoints = async function (req, res) {
    /**
     * Path Parameter : userIdx
     */
    const userIdx = req.params.userIdx;
    const userIdFromJWT = req.verifiedToken.userIdx;

    if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userIdx) {
        return res.send(errResponse(baseResponse.USER_JWT_TOKEN_WRONG));
    } else {
        const userPointResult = await userProvider.viewUserPoint(userIdx);
        return res.send(response(baseResponse.SUCCESS, userPointResult[0]));
    }
};
