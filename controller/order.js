//importar modulos
const mongoosePagination = require('mongoose-paginate-v2')

//importar modelos
const Stock = require("../models/stock")
const Product = require("../models/product")
const User = require("../models/user")

//end-point para crear stock
const createOrder = async (req, res) => {

    return res.status(200).json({
        status: "success",
        message: "order success",

    });

}


//end-point para eliminar
const deleteOrder = async (req, res) => {

    return res.status(200).json({
        status: "success",
        message: "order success",

    });

}


//end-point para listar
const list = async (req, res) => {

    return res.status(200).json({
        status: "success",
        message: "order success",

    });

}

//end-point para actualizar
const updateOrder = async (req, res) => {

    return res.status(200).json({
        status: "success",
        message: "order success",

    });

}

module.exports = {
    createOrder,
    deleteOrder,
    list,
    updateOrder
}
