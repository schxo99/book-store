const pool = require("../../middleware/db");

exports.orderPage = async (req, res) => {
    try {
        console.log("씨발 1");

        //장바구니 번호
        const basket_id = await pool.query(
            "select * from basket where user_user_id = ?",
            [req.session.uid]
        );
        //장바구니 도서목록
        const basket_list = await pool.query(
            "select * from basket_list where basket_basket_id = (select basket_id from basket where user_user_id = ?)",
            [req.session.uid]
        );
        //도서 상세정보
        const book_info = await pool.query(
            "select * from book where book_id = any(select book_book_id from basket_list where basket_basket_id = (select basket_id from basket where user_user_id = ?))",
            [req.session.uid]
        );
        //주소 목록
        const address_list = await pool.query(
            "select * from address where user_user_id = ?",
            [req.session.uid]
        );
        //카드목록
        const card_list = await pool.query(
            "select * from card where user_user_id = ?",
            [req.session.uid]
        );
        //총 금액
        const sum = await pool.query(
            "select sum(book_price) as sum from basket_list where basket_basket_id = (select basket_id from basket where user_user_id = ?)",
            [req.session.uid]
        );

        //아이디
        const user_id = req.session.uid;
        res.render("order", {
            basket_list: basket_list[0],
            address_list: address_list[0],
            card_list: card_list[0],
            book_info: book_info[0],
            sum: sum[0],
            user_id: user_id,
            basketStatus: true,
        });
    } catch (error) {
        console.log(error);
    }
};
exports.directOrder = async (req, res) => {
    try {
        const { book_id } = req.params;
        const { book_count } = req.body;
        //바로구매하는 책 정보
        const book_info = await pool.query(
            "select * from book where book_id = ?",
            [book_id]
        );
        //구매 수량 * 책 가격
        const book_price = book_info[0][0].book_price * book_count;
        console.log(book_price);
        //주소 목록
        const address_list = await pool.query(
            "select * from address where user_user_id = ?",
            [req.session.uid]
        );
        //카드목록
        const card_list = await pool.query(
            "select * from card where user_user_id = ?",
            [req.session.uid]
        );
        //유저 아이디
        const user_id = req.session.uid;
        res.render("order", {
            book_info: book_info[0],
            book_price: book_price,
            book_count: book_count,
            address_list: address_list[0],
            card_list: card_list[0],
            user_id: user_id,
            basketStatus: false,
            orderState: true,
        });
    } catch (error) {
        console.log(error);
    }
};
//
exports.payNow = async (req, res) => {
    try {
        const { card, book, bookcount, address } = req.body;
        //카드조회
        const card_info = await pool.query(
            "select * from card where user_user_id = ? and card_id = ?",
            [req.session.uid, card]
        );
        //주소 조회
        const address_info = await pool.query(
            "select * from address where user_user_id = ? and address_id = ?",
            [req.session.uid, address]
        );
        //등록 책 수정
        const book_info = await pool.query(
            "select * from book where book_id = ?",
            [book]
        );
        const reCount =
            parseInt(book_info[0][0].book_count) - parseInt(bookcount);
        const book_reCount = await pool.query(
            "update book set book_count = ? where book_id = ?",
            [reCount, book]
        );
        // order table에 추가
        //총 주문가격
        const order_price = parseInt(book_info[0][0].book_price) * bookcount;
        //주문날짜
        let today = new Date();
        const year = today.getFullYear().toString();
        const month = (today.getMonth() + 1).toString();
        const date = today.getDate().toString();
        const order_date = year.concat("/", month).concat("/", date);

        const addOrder = await pool.query(
            "insert into bookstore1.order (order_price, order_date, order_card_type, order_card_num, order_card_date, order_postnum, order_basicaddress, order_detailaddress, user_user_id) values (?, ?,?,?,?,?,?,?,?)",
            [
                order_price,
                order_date,
                card_info[0][0].card_type.toString(),
                card_info[0][0].card_num.toString(),
                card_info[0][0].card_date.toString(),
                address_info[0][0].address_postnum.toString(),
                address_info[0][0].address_basicaddress.toString(),
                address_info[0][0].address_detailaddress.toString(),
                req.session.uid,
            ]
        );
        //order_list 추가
        const maxOrder_id = await pool.query(
            "select max(order_id) as maxOrder_id from bookstore1.order where user_user_id = ?",
            [req.session.uid]
        );
        const addOrderList = await pool.query(
            "insert into bookstore1.order_list (order_order_id, book_book_id, book_count) values (?,?,?)",
            [maxOrder_id[0][0].maxOrder_id, book_info[0][0].book_id, bookcount]
        );
        res.redirect("orderHistory");
    } catch (error) {
        console.log(error);
    }
};
//장바구니에 담긴 품목 구매
exports.payBasket = async (req, res) => {
    try {
        const { card, address } = req.body;
        //카드조회
        const card_info = await pool.query(
            "select * from card where user_user_id = ? and card_id = ?",
            [req.session.uid, card]
        );
        // // //주소 조회
        const address_info = await pool.query(
            "select * from address where user_user_id = ? and address_id = ?",
            [req.session.uid, address]
        );
        //basket 정보
        const basket_info = await pool.query(
            "select * from basket where user_user_id = ?",
            [req.session.uid]
        );
        //basket_list 정보
        const basket_list_info = await pool.query(
            "select * from basket_list where basket_basket_id = (select basket_id from basket where user_user_id = ?)",
            [req.session.uid]
        );
        // order table에 추가
        //총 주문가격
        const order_price = await pool.query(
            "select sum(book_price) as order_price from basket_list where basket_basket_id = (select basket_id from basket where user_user_id = ?)",
            [req.session.uid]
        );
        //주문날짜
        let today = new Date();
        const year = today.getFullYear().toString();
        const month = (today.getMonth() + 1).toString();
        const date = today.getDate().toString();
        const order_date = year.concat("/", month).concat("/", date);
        const addOrder = await pool.query(
            "insert into bookstore1.order (order_price, order_date, order_card_type, order_card_num, order_card_date, order_postnum, order_basicaddress, order_detailaddress, user_user_id) values (?, ?,?,?,?,?,?,?,?)",
            [
                order_price[0][0].order_price,
                order_date,
                card_info[0][0].card_type.toString(),
                card_info[0][0].card_num.toString(),
                card_info[0][0].card_date.toString(),
                address_info[0][0].address_postnum.toString(),
                address_info[0][0].address_basicaddress.toString(),
                address_info[0][0].address_detailaddress.toString(),
                req.session.uid,
            ]
        );
        //order_list 추가
        const maxOrder_id = await pool.query(
            "select max(order_id) as maxOrder_id from bookstore1.order where user_user_id = ?",
            [req.session.uid]
        );
        //order_list에 추가
        for (var i = 0; i < basket_list_info[0].length; i++) {
            const addOrderList = await pool.query(
                "insert into bookstore1.order_list (order_order_id, book_book_id, book_count) values (?,?,?)",
                [
                    maxOrder_id[0][0].maxOrder_id,
                    basket_list_info[0][i].book_book_id,
                    basket_list_info[0][i].book_count,
                ]
            );
        }
        //book 정보 & basket_list 정보 겹치는 책 수정
        const book_info = await pool.query(
            "select * from book where book_id in (select book_book_id from basket_list where basket_basket_id = (select basket_id from basket where user_user_id = ?))",
            [req.session.uid]
        );
        for (var i = 0; i < basket_list_info[0].length; i++) {
            const discountBook = await pool.query(
                "update book set book_count = book_count - ? where book_id = ?",
                [
                    basket_list_info[0][i].book_count,
                    basket_list_info[0][i].book_book_id,
                ]
            );
        }
        //basket_list 비우기
        const deleteBasket_list = await pool.query(
            "delete from basket_list where basket_basket_id = (select basket_id from basket where user_user_id = ?)",
            [req.session.uid]
        );
        //basket 비우기
        const deleteBasket = await pool.query(
            "delete from basket where user_user_id = ?",
            [req.session.uid]
        );
        res.redirect("orderHistory");
    } catch (error) {
        console.log(error);
    }
};

exports.orderHistory = async (req, res) => {
    try {
        const showOrder = await pool.query(
            "select * from bookstore1.order where user_user_id = ?",
            [req.session.uid]
        );
        // console.log(showOrder[0][0]);
        res.render("orderHistory", {
            showOrder: showOrder[0],
            user_id: req.session.uid,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.orderHistoryDetail = async (req, res) => {
    try {
        const { order_id } = req.params;
        const order_info = await pool.query(
            "select * from bookstore1.order where order_id = ? and user_user_id = ?",
            [order_id, req.session.uid]
        );
        console.log(order_info[0]);
        const order_list_info = await pool.query(
            "select * from order_list where order_order_id = ?",
            [order_id]
        );
        console.log(order_list_info[0]);
        const book_info = await pool.query(
            "select * from book where book_id in (select book_book_id from order_list where order_order_id = ?)",
            [order_id]
        );
        console.log(book_info[0]);
        return res.render("orderHistoryDetail", {
            order_info: order_info[0],
            order_list_info: order_list_info[0],
            book_info: book_info[0],
        });
    } catch (error) {
        console.log(error);
    }
};
