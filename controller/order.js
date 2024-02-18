//importar modulos
const mongoosePagination = require('mongoose-paginate-v2')

//importar modelos
const Stock = require("../models/stock")
const Product = require("../models/product")
const User = require("../models/user")
const Address = require("../models/address")
const Order = require("../models/order")


//end-point para crear stock
const createOrder = async (req, res) => {
    const { userId, products, shippingAddress, totalPrice } = req.body;

    try {
        // Verificar que el usuario existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        // Verificar que los productos existen
        for (const productData of products) {
            const product = await Product.findById(productData.product);
            if (!product) {
                return res.status(404).json({
                    status: "error",
                    message: "Producto no encontrado"
                });
            }

            // Actualizar el stock
            await updateStock(productData.product, productData.quantity);
        }

        // Verificar que la dirección de envío existe
        const address = await Address.findById(shippingAddress);
        if (!address) {
            return res.status(404).json({
                status: "error",
                message: "Dirección de envío no encontrada"
            });
        }

        // Crear la orden
        const order = new Order({
            userId,
            products,
            shippingAddress,
            totalPrice,
        });

        // Guardar la orden
        await order.save();

        return res.status(200).json({
            status: "success",
            message: "Orden creada correctamente",
            order: order
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al crear la orden',
            error: error.message
        });
    }
}

//funcion para actualizar stock al crear la orden
const updateStock = async (productId, quantity) => {
    try {
        const stock = await Stock.findOne({ productId });

        if (!stock) {
            throw new Error(`No se encontró stock para el producto con ID ${productId}`);
        }

        // Verificar que haya suficiente stock
        if (stock.quantity < quantity) {
            throw new Error(`Stock insuficiente para el producto con ID ${productId}`);
        }

        stock.quantity -= quantity;
        await stock.save();
    } catch (error) {
        throw new Error(`Error al actualizar el stock: ${error.message}`);
    }
}


//end-point para eliminar
const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        console.log(userId)

        // Buscar la red y verificar si el usuario logueado es el creador
        const orderDelete = await Order.findOne({ _id: orderId, userId: userId });

        if (!orderDelete) {
            return res.status(404).json({
                status: 'error',
                message: 'order no encontrado o no tiene permisos para eliminarlo'
            });
        }

        // Verificar si el usuario logueado es el creador de la red
        if (orderDelete.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para eliminar esta direccion'
            });
        }

        await Order.findByIdAndDelete(orderId);

        return res.status(200).json({
            status: 'success',
            message: 'order eliminada correctamente',
            orderDelete: orderDelete
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar la order',
            error: error.message
        });
    }
}


//end-point para listar
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
        select: ("-password -email -role -__v")

    };

    try {
        // Filtrar el saldo por el ID del usuario
        const order = await Order.paginate({ userId: userId }, opciones);

        if (!order || order.docs.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró direcciones para este usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Listado de direcciones del usuario",
            order: order.docs,
            totalDocs: order.totalDocs,
            totalPages: order.totalPages,
            limit: order.limit,
            page: order.page,


        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar direcciones',
            error: error.message
        });
    }
};


//end-point para actualizar
const updateOrder = async (req, res) => {
    const { products, shippingAddress, totalPrice, status, quantity } = req.body;
    const id = req.params.id;

    try {
        // Verificar si la orden existe
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Orden no encontrada'
            });
        }

        // Crear la orden
        order.products = products.map((product, index) => ({
            product: product,
            quantity: quantity[index]
        }));
        order.shippingAddress = shippingAddress;
        order.totalPrice = totalPrice;
        order.status = status;

        // Guardar la orden
        await order.save();

        return res.status(200).json({
            status: "success",
            message: "Orden actualizada correctamente",
            order: order
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la orden',
            error: error.message
        });
    }
}

//end-point para buscar/listar una order
const listOrderId = async (req, res) => {

    const orderId = req.params.id

    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemPerPage = 4;

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 },
        select: ("-password -email -role -__v"),
        populate: { path: 'shippingAddress', select: '-__v' }
    };

    try {
        // Filtrar el saldo por el ID del usuario
        const order = await Order.paginate({  _id:orderId}, opciones);

        if (!order || order.docs.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró direcciones para este usuario"
            });
        }

        //buscar el producto._id para obtener el price unitario 

        return res.status(200).send({
            status: "success",
            message: "Listado de direcciones del usuario",
            order: order.docs,
            totalDocs: order.totalDocs,
            totalPages: order.totalPages,
            limit: order.limit,
            page: order.page,


        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar direcciones',
            error: error.message
        });
    }
};


module.exports = {
    createOrder,
    deleteOrder,
    list,
    updateOrder,
    listOrderId
}
