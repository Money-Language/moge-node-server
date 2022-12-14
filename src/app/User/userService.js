const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

// TODO: After 로그인 인증 방법 (JWT)
// 사용자 로그인
exports.postSignIn = async function (email, password) {
    try {
        // 이메일 여부 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);

        const selectEmail = emailRows[0].email

        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const selectUserPasswordParams = [selectEmail, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if (passwordRows[0].password !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(email);

        if (userInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        console.log(userInfoRows[0].id) // DB의 userId

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].id,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].id, 'jwt': token});

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// 소셜 계정 회원 가입
exports.createSocialUser = async function (email, nickname, profileImage, socialCreatedID, status) {
    try {
        // 이메일 중복 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length > 0) return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        // 닉네임 중복 확인
        const nicknameRows = await userProvider.nicknameCheck(nickname);
        if (nicknameRows.length > 0) return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);
        
        const insertKakaoUserInfoParams = [email, nickname, profileImage, socialCreatedID, status];
        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertSocialUser(connection, insertKakaoUserInfoParams);

        const result = {
            email: email,
            nickname: nickname,
            profileImage: profileImage,
            socialCreatedID : socialCreatedID,
            status: status,
        };

        // const userInfoRows = await userProvider.accountCheck(email);
        // if (userInfoRows[0].status === 'INACTIVE') {
        //     return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        // } else if (userInfoRows[0].status === 'DELETED') {
        //     return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        // }

        console.log(`소셜 로그인으로 추가된 회원 인덱스 번호 : ${userIdResult[0].insertId}`);
        connection.release();
        return response(baseResponse.SUCCESS, result);
        
    } catch (err) {
        logger.error(`App - createSocialUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};