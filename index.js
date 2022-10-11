const express = require('./config/express');
const {logger} = require('./config/winston');

// local 서버 테스트용
const port = 3000;

// // client 서버 테스트용
// const port = 3001;

// // production 서버 테스트용
// const port = 3002;

express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);