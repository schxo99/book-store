var express = require("express");
var router = express.Router();

const basketController = require("../controllers/basketController");

//장바구니 페이지
router.get("/", basketController.basketPage);

//장바구니 추가
router.post("/addBook/:book_id", basketController.addBook);

//장바구니
// router.get("/showBasket", basketController.showBasket);

//장바구니 도서 삭제
router.delete("/deleteBook/:book_id", basketController.deleteBook);

//장바구니 삭제
router.post("/deleteBasket", basketController.deleteBasket);
module.exports = router;
