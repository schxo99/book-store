const pool = require("../../middleware/db");

exports.basketPage = async (req, res) => {
    try {
        if (req.session.uid) {
            const user_info = await pool.query(
                "select user_id, user_name from user where user_id = ?",
                [req.session.uid]
            );
            const basket_info = await pool.query(
                "select * from basket where user_user_id = ?",
                [req.session.uid]
            );
            if (basket_info[0].length != 0) {
                const basket_list_info = await pool.query(
                    "select * from basket_list where basket_basket_id = ?",
                    [basket_info[0][0].basket_id]
                );
                const sumPrice = await pool.query(
                    "select sum(book_price) as sum from basket_list where basket_basket_id = ?",
                    [basket_info[0][0].basket_id]
                );
                const bookName = await pool.query(
                    "select * from book where book_id in (select book_book_id from basket_list)"
                );
                res.render("basket", {
                    signinStatus: true,
                    user_info: user_info[0],
                    basket_info: basket_info[0],
                    basket_list_info: basket_list_info[0],
                    sumPrice: sumPrice[0],
                    bookName: bookName[0],
                });
            } else {
                res.render("basket", {
                    signinStatus: true,
                    user_info: user_info[0],
                    basket_info: basket_info[0],
                    basket_list_info: [],
                    // sumPrice: 0,
                    // bookName: [],
                });
            }
            // console.log(basket_list_info[0]);
        }
    } catch (error) {
        console.log(error);
    }
};

exports.addBook = async (req, res) => {
    const { book_id } = req.params;
    const { book_count } = req.body;
    console.log(book_id, book_count);
    const basketIsIt = await pool.query("select basket_id from basket");
    const book_info = await pool.query("select * from book where book_id = ?", [
        book_id,
    ]);

    try {
        //장바구니없을 때
        if (basketIsIt[0].length === 0) {
            //생성날짜 추가
            let today = new Date();
            const year = today.getFullYear().toString();
            const month = (today.getMonth() + 1).toString();
            const date = today.getDate().toString();
            const makeDate = year.concat("/", month).concat("/", date);
            const addBasket = await pool.query(
                "insert into basket  (basket_createdate, user_user_id) values(?,?)",
                [makeDate, req.session.uid]
            );
            //장바구니 id 조회
            const basket_info = await pool.query("select * from basket");
            //책 가격 조회
            const book_info = await pool.query(
                "select * from book where book_id = ?",
                [book_id]
            );
            //책 가격 권수 계산
            const book_price =
                parseInt(book_info[0][0].book_price) * book_count;
            //basket_list에 추가
            const addBook = await pool.query(
                "insert into basket_list (basket_basket_id, book_book_id, book_count, book_price) values(?,?,?,?)",
                [basket_info[0][0].basket_id, book_id, book_count, book_price]
            );
        } //장바구니 있을 때 책 추가
        else {
            //같은 책이 담겨있는경우 먼저 조회
            const bookisit = await pool.query(
                "select * from basket_list where book_book_id = ?",
                [book_id]
            );
            //책 정보 조회

            //장바구니에 같은 책이 있는 경우
            if (bookisit[0].length !== 0) {
                const count =
                    parseInt(bookisit[0][0].book_count) + parseInt(book_count);
                const price =
                    parseInt(bookisit[0][0].book_price) +
                    parseInt(book_info[0][0].book_price) * parseInt(book_count);
                const addBookCount = await pool.query(
                    "update basket_list set book_count = ?, book_price = ? where book_book_id = ?",
                    [count, price, book_id]
                );
            }
            //같은 책이 없는 경우
            else {
                const price =
                    parseInt(book_info[0][0].book_price) * parseInt(book_count);
                const bookadd = await pool.query(
                    "insert into basket_list (basket_basket_id, book_book_id, book_count, book_price) values(?,?,?,?)",
                    [basketIsIt[0][0].basket_id, book_id, book_count, price]
                );
            }
        }
        return res.redirect("/");
    } catch (error) {
        console.log(error);
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { book_id } = req.params;
        console.log(book_id);
        const deleteBook = await pool.query(
            "delete from basket_list where book_book_id = ?",
            [book_id]
        );
        return res.redirect("/basket");
    } catch (error) {
        console.log(error);
    }
};
//장바구니 삭제
exports.deleteBasket = async (req, res) => {
    try {
        const deleteBasket_list = await pool.query("delete  from basket_list");
        const deleteBasket = await pool.query("delete  from basket");
        return res.redirect("/basket");
    } catch (error) {
        console.log(error);
    }
};
