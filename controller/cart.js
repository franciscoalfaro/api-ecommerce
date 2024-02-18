//importar modulos
const mongoosePagination = require('mongoose-paginate-v2')

//importar modelos
const Stock = require("../models/stock")
const Product = require("../models/product")
const User = require("../models/user")
const Address = require("../models/address")
const Order = require("../models/order")


//end-point para crear carrito
const createCart = async (req, res) => {

    return res.status(200).json({
        status: "success",
        message: "cart success",

    });

}



//end-point para eliminar
const deleteCart = async (req, res) => {

    return res.status(200).json({
        status: "success",
        message: "cart success",

    });

}


//end-point para listar
const list = async (req, res) => {
    return res.status(200).json({
        status: "success",
        message: "cart success",
    });

}

//end-point para actualizar
const updateCart = async (req, res) => {

    return res.status(200).json({
        status: "success",
        message: "cart success",

    });

}

module.exports = {
    createCart,
    deleteCart,
    list,
    updateCart
}
