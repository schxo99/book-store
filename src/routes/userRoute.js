var express = require("express");
var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

const userController = require("../controllers/userController");

//로그인
router.get("/signin", userController.signin);
router.post("/signin", userController.login);

//로그아웃
// router.get('/logout', userController.logout)

//회원가입 페이지
router.get("/signup", userController.signup);
router.post("/signup", userController.register);

//로그인 페이지
// router.get('/signin', userController.signinPage)

module.exports = router;
