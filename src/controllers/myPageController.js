const pool = require("../../middleware/db");

exports.mypage = async (req, res) => {
    try {
        if (req.session.uid) {
            const user_info = await pool.query(
                "select user_id, user_name from user where user_id = ?",
                [req.session.uid]
            );
            const user_card_info = await pool.query(
                "select * from card where user_user_id = ?",
                [req.session.uid]
            );
            const user_address_info = await pool.query(
                "select * from address where user_user_id = ?",
                [req.session.uid]
            );
            // console.log(user_card_info[0]);
            // console.log(user_address_info[0]);
            res.render("mypage", {
                user_info: user_info[0],
                user_card_info: user_card_info[0],
                user_address_info: user_address_info[0],
                signinStatus: true,
            });
        } else {
            res.redirect("signin");
        }
    } catch (error) {
        console.log(error);
    }
};
// 카드추가
exports.addCard = async (req, res) => {
    try {
        const { card_num, card_date, card_type } = req.body;
        const user_user_id = req.session.uid;
        const user_card_info = await pool.query(
            "insert into card (card_num, card_date, card_type, user_user_id) values(?,?,?,?)",
            [card_num, card_date, card_type, user_user_id]
        );
        return res.redirect("/mypage");
    } catch (error) {
        console.log(error);
    }
};
//주소추가
exports.addAddress = async (req, res) => {
    try {
        const { postnum, basicAddress, detailAddress } = req.body;
        const user_user_id = req.session.uid;
        const user_address_info = await pool.query(
            "insert into address (address_postnum, address_basicaddress, address_detailaddress, user_user_id) values(?,?,?,?)",
            [postnum, basicAddress, detailAddress, user_user_id]
        );
        return res.redirect("/mypage");
    } catch (error) {
        console.log(error);
    }
};

//카드삭제 아이디 추가수정
exports.deleteCard = async (req, res) => {
    try {
        const { card_num } = req.params;
        const deleteCard = await pool.query(
            "delete from card where card_num = ?",
            [card_num]
        );
        return res.redirect("/mypage");
    } catch (error) {
        console.log(error);
    }
};
//주소삭제 아이디 추가수정
exports.deleteAddress = async (req, res) => {
    try {
        const { address_id } = req.params;
        console.log(address_id);
        const deleteAddress = await pool.query(
            "delete from address where address_id = ?",
            [address_id]
        );
        return res.redirect("/mypage");
    } catch (error) {
        console.log(error);
    }
};
