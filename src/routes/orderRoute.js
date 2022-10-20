var express = require("express");
var router = express.Router();

const orderController = require("../controllers/orderController");

// 장바구니 주문 주문페이지
router.get("/", orderController.orderPage);

// 바로구매페이지
router.post("/directOrder/:book_id", orderController.directOrder);

// 주문내역
router.get("/orderHistory", orderController.orderHistory);

//바로구매
router.post("/paynow", orderController.payNow);

//장바구니 구매
router.post("/payBasket", orderController.payBasket);

//주문완료 상세보기
router.post(
    "/orderHistoryDetail/:order_id",
    orderController.orderHistoryDetail
);

module.exports = router;
