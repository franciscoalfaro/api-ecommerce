const express = require("express")
const router = express.Router()

const CartController = require("../controller/cart")
const check = require("../middlewares/auth")



//definir ruta
router.post("/create",check.auth, CartController.createCart)
router.put("/update/:id",check.auth, CartController.updateCart)
router.delete("/delete/:id",check.auth, CartController.deleteCart)
router.get("/list/:page?",check.auth, CartController.list)


//exportar router
module.exports=router