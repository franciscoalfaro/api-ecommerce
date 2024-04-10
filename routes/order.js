const express = require("express")
const router = express.Router()

const OrderController = require("../controller/order")
const check = require("../middlewares/auth")



//definir ruta
router.post("/create",check.auth, OrderController.createOrder)
router.post("/createguest", OrderController.createOrderForGuest)
router.put("/update/:id",check.auth, OrderController.updateOrder)
router.put("/updatestatus/:id",check.auth, OrderController.updateStatusOrder)

router.delete("/delete/:id",check.auth, OrderController.deleteOrder)
router.get("/list/:page?",check.auth, OrderController.list)
router.get("/listall/:page?",check.auth, OrderController.listAllOrder)
router.get("/listdrop",check.auth, OrderController.listDropAllorder)

router.get("/orderNum/:id", OrderController.listOrderId)
router.post("/cancel/:id", OrderController.cancelOrder)


//exportar router
module.exports=router