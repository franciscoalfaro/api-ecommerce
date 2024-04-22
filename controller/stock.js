//importar modulos
const mongoosePagination = require('mongoose-paginate-v2')
//importar modelo

const User = require("../models/user")
const Stock = require("../models/stock")
const Product = require("../models/product")

//end-point para crear stock
const createStock = async (req, res) => {
    const params = req.body;
    const productId = req.params.id

    if (!productId || !params.quantity || !params.location) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar",
        });
    }

    try {
        const { quantity, location } = params;
        const userId = req.user.id;

        let stockExistente = await Stock.findOne({ productId });
        console.log('stock',stockExistente)

        if (stockExistente) {
            stockExistente.quantity = quantity;
            stockExistente.lastUpdatedAt = Date.now();
            await stockExistente.save();

            return res.status(200).json({
                status: 'success',
                message: 'Stock actualizado correctamente',
                stock: stockExistente
            });

        }

        const newStock = new Stock({
            productId,
            userId,
            quantity,
            location,
        });

        // Guarda el nuevo stock
        await newStock.save();

        // Actualiza el producto con la referencia al nuevo stock
        await Product.findByIdAndUpdate(productId, { stock: newStock._id });

        return res.status(200).json({
            status: "success",
            message: "Stock creado correctamente",
            stock: newStock,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Error al crear el stock",
            error: error.message || "Error desconocido",
        });
    }
}

//end-point para eliminar stock
const deleteStock = async (req, res) => {
    const stockId = req.params.id;

    try {
        const stock = await Stock.findById(stockId);

        if (!stock) {
            return res.status(404).json({
                status: "error",
                message: "El stock no fue encontrado",
            });
        }

        // Verificar si el usuario es el propietario del stock o un admin
        if (req.user.id !== stock.userId && req.user.role !== "admin") {
            return res.status(403).json({
                status: "error",
                message: "No tienes permiso para eliminar este stock",
            });
        }

        await Stock.findByIdAndDelete(stockId);

        return res.status(200).json({
            status: "success",
            message: "Stock eliminado correctamente",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Error al eliminar el stock",
            error: error.message || "Error desconocido",
        });
    }
}

//end-point para listar stock
const list = async (req, res) => {
    const userId = req.user.id; // Obtener el ID del usuario autenticado desde el token

    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemPerPage = 4;

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 },
        select: '-password -email -role -__v',
        populate: { path: 'productId', select: 'name' }// Utilizar populate para obtener los detalles del producto asociado al stock
    };

    try {
        // Filtrar el stock por el ID del producto
        const stock = await Stock.paginate({}, opciones);

        if (!stock || stock.docs.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró stock para el producto',
            });
        }

        return res.status(200).send({
            status: 'success',
            message: 'Stock producto',
            stock: stock.docs,
            totalDocs: stock.totalDocs,
            totalPages: stock.totalPages,
            limit: stock.limit,
            page: stock.page,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar el stock',
            error: error.message,
        });
    }
};

//end-point para actualizar stock
const updateStock = async (req, res) => {
    const productId = req.params.id;
    const { quantity, location } = req.body;

    try {
        // Verificar que el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });
        }

        // Verificar si existe un stock para la ubicación especificada
        let stock = await Stock.findOne({ productId, location });

        // Si no existe un stock, crear uno nuevo
        if (!stock) {
            stock = new Stock({
                productId,
                location,
                quantity
            });
        } else {
            // Si ya existe un stock, actualizar la cantidad
            stock.quantity = parseInt(quantity);
        }

        // Guardar el stock
        await stock.save();

        return res.status(200).json({
            status: "success",
            message: "Stock actualizado correctamente",
            stock: stock
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el stock',
            error: error.message
        });
    }
}

//filtrar stock de un producto





module.exports = {
    createStock,
    deleteStock,
    list,
    updateStock
}