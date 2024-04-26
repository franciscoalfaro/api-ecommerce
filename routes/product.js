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
router.post("/spect/:id", check.auth, ProductController.specifications)
router.delete("/deletespect/:id", check.auth, ProductController.deleteSpect)

//imagenes
router.post("/uploads/:id",[check.auth, uploads.array("files")], ProductController.upload)
router.delete("/deleteImages/:id",check.auth, ProductController.deleteImages)
//traermedia
router.get("/media/:file", ProductController.media)

//buscar productos
router.get("/search/:product/:page?", ProductController.search);

//listar los productos
router.get("/list/:page?", ProductController.listProduct)
router.get("/productcategory/:id/:page?", ProductController.getProductCategory)


//ofertas
router.get("/offers/:page?", ProductController.offerPrice)

//producto destacado

router.get("/featuredproduct/:page?", ProductController.featuredProducts)

//productos mas vendidos
router.get("/bestselling/:page?", ProductController.BestSellingProducts)
router.get("/bestlist/:page?", check.auth, ProductController.listBestSelling)

router.get("/sales/:page?", check.auth, ProductController.ventas)


//consultar y traer el producto por el id
router.get("/obtenido/:id", ProductController.getProduct)






module.exports=router