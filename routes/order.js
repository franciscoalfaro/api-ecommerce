const express = require("express")
const router = express.Router()

const OrderController = require("../controller/order")
const check = require("../middlewares/auth")



//definir ruta
router.post("/create",check.auth, OrderController.createOrder)
router.put("/update/:id",check.auth, OrderController.updateOrder)
router.delete("/delete/:id",check.auth, OrderController.deleteOrder)
router.get("/list/:page?",check.auth, OrderController.list)


//exportar router
module.exports=router