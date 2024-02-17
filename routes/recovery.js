const express = require("express")
const router = express.Router()

const RecoveryController = require("../controller/recovery")

router.post("/newpass", RecoveryController.recuperarContrasena)

//exportar router
module.exports=router