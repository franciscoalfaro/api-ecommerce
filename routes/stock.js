const express = require("express")
const router = express.Router()

const StockController = require("../controller/stock")
const check = require("../middlewares/auth")



//definir ruta
router.post("/create/:id",check.auth, StockController.createStock)
router.put("/update/:id",check.auth, StockController.updateStock)
router.delete("/delete/:id",check.auth, StockController.deleteStock)
router.get("/list/:page?",check.auth, StockController.list)


//exportar router
module.exports=router