const express = require("express")
const router = express.Router()
const CategoryController = require("../controller/category")
const check = require("../middlewares/auth")

//ruta para crear actualizar y elmiminar gastos
router.post("/newcategory",check.auth, CategoryController.createCategory)

router.put("/update/:id",check.auth, CategoryController.updateCategory)
router.delete("/delete/:id",check.auth, CategoryController.deleteCategory)
router.get("/list",check.auth, CategoryController.listCategorys)
router.get("/listcategorys/", CategoryController.listCategorysDrop)



module.exports=router