//importar dependencia de conexion
const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors")


console.log("API Connection success")
// efectuar conexion a BD
connection();

const app = express();
const puerto = 3000;

//configurar cors
app.use(cors());

//conertir los datos del body a obj js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//cargar rutas
const UserRoutes = require("./routes/user")
const AddressRoutes = require("./routes/address")
const ProductRoutes = require("./routes/product")
const CategoryRoutes = require("./routes/category")
const StockRoutes = require("./routes/stock")
const OrderRoutes = require("./routes/order")
const CartRoutes = require("./routes/cart")

//recovery
const RecoveryRouter = require("./routes/recovery")



//app.use("/api/", )
app.use("/api/user", UserRoutes)
app.use("/api/address", AddressRoutes)
app.use("/api/product", ProductRoutes)
app.use("/api/category", CategoryRoutes)
app.use("/api/stock", StockRoutes)
app.use("/api/order", OrderRoutes)
app.use("/api/cart", CartRoutes)

//recovery
app.use("/api/recovery", RecoveryRouter)






//escuchar peticiones 
app.listen(puerto, () => {
    console.log("Server runing in port :" + puerto)
})