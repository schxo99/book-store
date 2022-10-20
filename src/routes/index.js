var express = require("express");
var router = express.Router();

// exports
const pool = require("../../middleware/db");

router.get("/", async (req, res) => {
    // 메인 화면에 표시할 책 정보를 모두 가져오기
    const books = await pool.query("SELECT * FROM book");
    // 만약 현재 세션에 사용자가 로그인 한 후 로그아웃 된 기록이 없다면
    if (req.session.uid) {
        const user_info = await pool.query(
            "select user_id, user_name from user where user_id = ?",
            [req.session.uid]
        );
        const user_basket_info = await pool.query(
            "select basket_id from basket where user_user_id = ?",
            [req.session.uid]
        );
        res.render("index", {
            user_info: user_info[0][0],
            signinStatus: true, // 세션에 값이 있는가: true => 로그인 되어 있음
            books: books[0], // 데이터 베이스에 저장된 책 정보
            num: books[0].length, // 데이터 베이스에 저장된 전체 책 수량
            basketAmount: user_basket_info[0].length,
        });
        // 세션에 사용자 정보가 없다면 signinStatus를 false로 설정하여 ejs 화면을 로그인 전 / 후로 다르게 나타내기
    } else {
        res.render("index", {
            signinStatus: false,
            books: books[0],
            num: books[0].length,
        });
    }
});
//도서 검색
router.post("/search", async (req, res) => {
    try {
        if (req.session.uid) {
            const user_info = await pool.query(
                "select user_id, user_name from user where user_id = ?",
                [req.session.uid]
            );
            const { search } = req.body;
            const searchBook = await pool.query(
                "select * from book where book_name like ?",
                ["%" + search + "%"]
            );
            return res.render("index", {
                user_info: user_info[0][0],
                signinStatus: true,
                books: searchBook[0],
                num: searchBook[0].length,
            });
        } else {
        }
    } catch (error) {
        console.log(error);
    }
});
//검색한 책 화면 띄우기
router.get("/search", async (req, res) => {
    try {
        console.log("넘어옴");
        console.log(searchBook[0]);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
