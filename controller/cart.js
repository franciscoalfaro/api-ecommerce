//importar modulos
const mongoosePagination = require('mongoose-paginate-v2')

//importar modelos
const Stock = require("../models/stock.js")
const Product = require("../models/product.js")
const User = require("../models/user.js")
const Address = require("../models/address.js")
const Order = require("../models/order.js")
const Cart = require("../models/cart.js")



//end-point para crear carrito
const createCart = async (req, res) => {
    const { items } = req.body;
    const userId = req.user.id

    try {
        // Verificar si el usuario existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si ya existe un carrito para este usuario
        let cart = await Cart.findOne({ userId: userId });

        if (cart) {
            // Si el carrito ya existe, agregar los nuevos elementos al carrito
            for (const newItem of items) {
                const existingItem = cart.items.find(item => item.product.equals(newItem.product));
                if (existingItem) {
                    // Si el producto ya existe en el carrito, aumentar la cantidad
                    existingItem.quantity += newItem.quantity;
                } else {
                    // Si el producto no existe en el carrito, agregarlo
                    cart.items.push(newItem);
                }
            }
        } else {
            // Si el carrito no existe, crear uno nuevo
            cart = new Cart({
                userId,
                items
            });
        }

        // Eliminar el campo _id adicional de cada elemento de items
        cart.items.forEach(item => delete item._id);

        // Guardar el carrito
        await cart.save();

        return res.status(200).json({
            status: "success",
            message: "Carrito creado o actualizado correctamente",
            cart: cart
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al crear o actualizar el carrito',
            error: error.message
        });
    }
}






//end-point para eliminar
const deleteCart = async (req, res) => {
    const { userId } = req.user.id;


    try {
        // Buscar el carrito del usuario por su ID
        const cart = await Cart.findOne({ userId });

        // Si no se encuentra el carrito, devolver un error
        if (!cart) {
            return res.status(404).json({
                status: "error",
                message: "Carrito no encontrado"
            });
        }

        // Eliminar el carrito de la base de datos
        await Cart.deleteOne({ userId });

        return res.status(200).json({
            status: "success",
            message: "Carrito eliminado correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el carrito',
            error: error.message
        });
    }
}


//end-point para listar
const list = async (req, res) => {
    const userId = req.user.id

    try {
        // Buscar el carrito del usuario por su ID
        const cart = await Cart.findOne({ userId });

        // Si no se encuentra el carrito, devolver un error
        if (!cart) {
            return res.status(404).json({
                status: "error",
                message: "Carrito no encontrado"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Carrito encontrado",
            cart
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar el carrito',
            error: error.message
        });
    }
}

//end-point para actualizar
const updateCart = async (req, res) => {
    const userId = req.user.id
    const { items } = req.body;
    console.log(userId)

    try {
        // Buscar el carrito del usuario por su ID
        const cart = await Cart.findOne({ userId });

        // Si no se encuentra el carrito, devolver un error
        if (!cart) {
            return res.status(404).json({
                status: "error",
                message: "Carrito no encontrado"
            });
        }

        // Actualizar los items del carrito
        cart.items = items;




        // Guardar los cambios en el carrito
        await cart.save();

        return res.status(200).json({
            status: "success",
            message: "Carrito actualizado correctamente",
            cart
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el carrito',
            error: error.message
        });
    }
}

module.exports = {
    createCart,
    deleteCart,
    list,
    updateCart
}
