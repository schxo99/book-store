const pool = require("../../middleware/db");

exports.bookDetail = async (req, res) => {
    try {
        if (req.session.uid) {
            const { book_id } = req.params;
            //사용자 정보
            const user_info = await pool.query(
                "select * from user where user_id = ?",
                [req.session.uid]
            );
            //책 정보
            const book_info = await pool.query(
                "select * from book where book_id = ?",
                [book_id]
            );
            res.render("book", {
                signinStatus: true,
                user_info: user_info[0],
                book_info: book_info[0],
            });
        }
    } catch (error) {
        console.log(error);
    }
};
