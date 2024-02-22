const express = require("express")
const router = express.Router()
const multer = require("multer")
const ProductController = require("../controller/product")
const check = require("../middlewares/auth")

//configuracion de subida
const storage = multer.diskStorage({
    destination:(req,file, cb) =>{
        cb(null,"./uploads/products")

    },

    filename:(req,file, cb) =>{
        cb(null,"products-"+Date.now()+"-"+file.originalname)
        
    }
})

const uploads = multer({storage})

//crear, eliminar, update
router.post("/create",check.auth, ProductController.createProduct)
router.delete("/delete/:id",check.auth, ProductController.deleteProduct)
router.put("/update/:id",check.auth, ProductController.updateProduct)

//imagenes
router.post("/upload/:id",[check.auth, uploads.array("files")], ProductController.upload)
router.delete("/deleteImages/:id",check.auth, ProductController.deleteImages)
//traermedia
router.get("/media/:file", ProductController.media)

//buscar productos
router.get("/search/:product/:page?", ProductController.search);

//listar los productos
router.get("/list/:page?", ProductController.listProduct)
router.get("/productcategory/:id/:page?", ProductController.getProductCategory)

//consultar y traer el producto por el id
router.get("/obtenido/:id", ProductController.getProduct)

router.get("/offers", ProductController.offerPrice)

//productos mas vendidos
router.get("/bestselling/:page?", ProductController.BestSellingProducts)







module.exports=router