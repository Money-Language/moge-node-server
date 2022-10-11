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
 * API No. 4
 * API Name : 카카오 로그인
 * [POST] /app/users/login/kakao
 */
exports.loginKakao = async function (req, res) {
    const { accessToken } = req.body;
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
        const name = kakao_profile.data.kakao_account.profile.nickname;
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
            const result = {
                email: email,
                nickname: name,
                profileImage: profileUrl,
                status: 'KAKAO',
            };
            const signUpResponse = await userService.createkakaoUser(
                result.email,
                result.nickname,
                result.profileImage,
                result.status,
            );
            return res.send(response(baseResponse.SUCCESS, result));
        }
    } catch (err) {
        logger.error(`App - logInKakao Query error\n: ${JSON.stringify(err)}`);
        return res.send(errResponse(baseResponse.USER_INFO_EMPTY));
    }
};