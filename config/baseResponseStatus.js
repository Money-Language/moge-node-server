module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" }, // ?

    //Request error
    SIGNUP_EMAIL_EMPTY : { "isSuccess": false, "code": 2001, "message":"이메일을 입력해주세요" },
    SIGNUP_EMAIL_LENGTH : { "isSuccess": false, "code": 2002, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNUP_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNUP_PASSWORD_EMPTY : { "isSuccess": false, "code": 2004, "message": "비밀번호를 입력 해주세요." },
    SIGNUP_PASSWORD_LENGTH : { "isSuccess": false, "code": 2005, "message":"비밀번호는 6~20자리를 입력해주세요." },
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2006, "message":"닉네임을 입력 해주세요." },
    SIGNUP_NICKNAME_LENGTH : { "isSuccess": false,"code": 2007,"message":"닉네임은 최대 20자리를 입력해주세요." },

    SIGNIN_EMAIL_EMPTY : { "isSuccess": false, "code": 2008, "message":"이메일을 입력해주세요" },
    SIGNIN_EMAIL_LENGTH : { "isSuccess": false, "code": 2009, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNIN_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2010, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNIN_PASSWORD_EMPTY : { "isSuccess": false, "code": 2011, "message": "비밀번호를 입력 해주세요." },

    USER_USERID_EMPTY : { "isSuccess": false, "code": 2012, "message": "userId를 입력해주세요." },
    USER_USERID_NOT_EXIST : { "isSuccess": false, "code": 2013, "message": "해당 유저가 존재하지 않습니다." },

    USER_USEREMAIL_EMPTY : { "isSuccess": false, "code": 2014, "message": "이메일을 입력해주세요." },
    USER_USEREMAIL_NOT_EXIST : { "isSuccess": false, "code": 2015, "message": "해당 이메일을 가진 회원이 존재하지 않습니다." },
    USER_ID_NOT_MATCH : { "isSuccess": false, "code": 2016, "message": "유저 아이디 값을 확인해주세요" },
    USER_NICKNAME_EMPTY : { "isSuccess": false, "code": 2017, "message": "변경할 닉네임 값을 입력해주세요" },

    USER_STATUS_EMPTY : { "isSuccess": false, "code": 2018, "message": "회원 상태값을 입력해주세요" },

    USER_JWT_TOKEN_WRONG : { "isSuccess": false, "code": 2019, "message": "JWT 토큰이 올바르지 않습니다." },
    USER_ACCESS_TOKEN_WRONG : { "isSuccess": false, "code": 2020, "message": "accessToken이 올바르지 않습니다." },
    USER_INFO_EMPTY : { "isSuccess": false, "code": 2021, "message": "유저 정보가 비어 있습니다." },
    USER_BOARD_LIST_EMPTY : { "isSuccess": false, "code": 2022, "message": "해당 유저가 작성한 게시글이 없습니다." },

    CATEGORY_CATEGORY_IDX_NOT_EXIST : { "isSuccess": false, "code": 2023, "message": "해당 카테고리가 존재하지 않습니다." },
    CATEGORY_LIST_EMPTY : { "isSuccess": false, "code": 2024, "message": "해당 카테고리에 존재하는 퀴즈가 없습니다." },

    BOARD_BOARDIDX_EMPTY : { "isSuccess": false, "code": 2025, "message": "게시글 인덱스가 비어있습니다." },
    BOARD_BOARDIDX_NOT_EXIST : { "isSuccess": false, "code": 2026, "message": "해당 게시글은 존재하지 않습니다." },
    
    QUIZ_QUIZIDX_NOT_EXIST : { "isSuccess": false, "code": 2027, "message": "해당 퀴즈 문제는 존재하지 않습니다." },
    QUIZ_BOARDIDX_NOT_EXIST : { "isSuccess": false, "code": 2028, "message": "해당 퀴즈 문제는 해당 게시글에 존재하지 않습니다." },

    ANSWER_ANSWERSELECTIDX_INCORRECT : { "isSuccess": false, "code": 2029, "message": "answerSelectIdx는 '01', '02' 중에서만 선택 가능합니다. " },

    BOARD_CATEGORYIDX_NOT_EXIST : { "isSuccess": false, "code": 2030, "message": "카테고리 인덱스를 입력해 주세요." },
    BOARD_TITLE_NOT_EXIST : { "isSuccess": false, "code": 2031, "message": "게시글 제목을 입력해 주세요."  },
    BOARD_QUIZ_QUESTION_NOT_EXIST : { "isSuccess": false, "code": 2032, "message": "퀴즈 문제를 입력해 주세요." },
    BOARD_QUIZ_QUIZTYPE_NOT_EXIST : { "isSuccess": false, "code": 2033, "message": "퀴즈 타입을 입력해 주세요." },
    BOARD_ANSWER_HINT_NOT_EXIST : { "isSuccess": false, "code": 2034, "message": "정답 힌트를 입력해 주세요." },
    BOARD_ANSWER_SELECTIDX_NOT_EXIST : { "isSuccess": false, "code": 2035, "message": "정답 여부 선택자를 입력해 주세요." },
    BOARD_ANSWER_ANSWER_EXIST : { "isSuccess": false, "code": 2036, "message": "정답 답안을 입력해 주세요." },
    BOARD_QUIZIDX_NOT_EXIST : { "isSuccess": false, "code": 2037, "message": "퀴즈 인덱스가 존재하지 않습니다." },

    POINT_QUIZIDX_EXIST : { "isSuccess": false, "code": 2038, "message": "퀴즈 인덱스를 입력해 주세요." },
    USER_QUIZ_MAKER_SAME : { "isSuccess": false, "code": 2039, "message": "자기가 낸 문제는 자기가 풀 수 없습니다." },



    // Response error
    SIGNUP_REDUNDANT_EMAIL : { "isSuccess": false, "code": 3001, "message":"중복된 이메일입니다." },
    SIGNUP_REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"사용 중인 별명입니다." },

    SIGNIN_EMAIL_WRONG : { "isSuccess": false, "code": 3003, "message": "아이디가 잘못 되었습니다." },
    SIGNIN_PASSWORD_WRONG : { "isSuccess": false, "code": 3004, "message": "비밀번호가 잘못 되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3005, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3006, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },

    SUBJECTIVE_ANSWERSELECTIDX_NOT_EXIST : { "isSuccess": false, "code": 3009, "message": "주관식 정답에는 answerSelected가 01 고정입니다." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},

}
