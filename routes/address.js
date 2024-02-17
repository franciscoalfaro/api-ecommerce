const express = require("express")
const router = express.Router()
const multer = require("multer")
const AddressController = require("../controller/address")
const check = require("../middlewares/auth")

//definir rutas

router.post("/create",check.auth, AddressController.createAddress)
router.delete("/delete/:id",check.auth, AddressController.deleteAddress)
router.put("/update/:id",check.auth, AddressController.updateAddress)
router.get("/list/:page?",check.auth, AddressController.listAddress)


//exportar router
module.exports=router