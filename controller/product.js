const fs = require("fs")
const path = require("path")
const validarProduct = require("../helpers/validateProduct")
const Product = require("../models/product")
const Category = require("../models/category")
const Stock = require("../models/stock")
const mongoosePagination = require('mongoose-paginate-v2')
const User = require("../models/user")
const Order = require("../models/order")
const Bestselling = require("../models/bestselling")
const Sale = require("../models/sale")



//end-point para crear Products
const createProduct = async (req, res) => {

    try {
        const userId = req.user.id;
        const params = req.body;

        const requiredFields = ['name', 'description', 'brand', 'size', 'price', 'category'];
        const missingFields = requiredFields.filter(field => !params[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                status: "error",
                message: `Faltan campos obligatorios: ${missingFields.join(', ')}`
            });
        }
        //se comprueba desde helpers-validate
        validarProduct.validar(params);        

        let existsCategory = await Category.findOne({ userId, name: params.category });

        //se busca el usuario por el id, y se extre el nombre para mostrar en la respuesta
        let usuarioPublicacion = await User.findOne({ _id: userId })


        if (!existsCategory) {
            existsCategory = await Category.create({ userId, name: params.category });
        }


        const newProduct = await Product.create({
            userId: userId,
            name: params.name,
            description: params.description,
            brand: params.brand,
            size: params.size,
            price: params.price,
            Autor: usuarioPublicacion.name,
            category: existsCategory._id,
            stock: params.stock

        });

        await newProduct.save();

        return res.status(200).json({
            status: "success",
            message: "producto creado de forma correcta",
            newProduct,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al crear el producto",
            error: error.message || "Error desconocido",
        });
    }
}



//end-point para subir imagenes a los Products
const upload = async (req, res) => {
    // Sacar el ID del producto
    const productId = req.params.id;

    // Recoger los archivos de imagen
    const files = req.files;

    // Verificar si se proporcionaron archivos de imagen
    if (!files || files.length === 0) {
        return res.status(404).send({
            status: "error",
            message: "No se seleccionaron imágenes",
        });
    }

    try {
        const validExtensions = ["png", "jpg", "jpeg", "gif"];
        const invalidFiles = [];
        const validFiles = [];

        // Verificar las extensiones de los archivos
        files.forEach(file => {
            const imageSplit = file.originalname.split(".");
            const extension = imageSplit[imageSplit.length - 1].toLowerCase();

            if (!validExtensions.includes(extension)) {
                // Si la extensión no es válida, agregar el archivo a la lista de archivos inválidos
                invalidFiles.push(file.originalname);
            } else {
                // Si la extensión es válida, agregar el archivo a la lista de archivos válidos
                validFiles.push(file);
            }
        });

        // Si hay archivos con extensiones inválidas, devolver un error
        if (invalidFiles.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "Las siguientes imágenes tienen extensiones no válidas: " + invalidFiles.join(", "),
            });
        }

        // Crear un array de objetos con los datos de cada archivo
        const imagesData = validFiles.map(file => ({
            filename: file.filename,
        }));

        // Actualizar el producto con las imágenes subidas
        const product = await Product.findOneAndUpdate(
            { "userId": req.user.id, "_id": productId },
            { $push: { images: imagesData } },
            { new: true }
        );

        if (!product) {
            // Si el producto no se encuentra, devolver un error
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        // Entregar una respuesta con éxito y la información del producto actualizada
        return res.status(200).json({
            status: "success",
            message: "Imágenes subidas correctamente",
            product: product,
        });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        });
    }
};


//end-point para eliminar una o varias imagenes. se identifica por id de la imagen  issue se debe de eliminar imagen del servidor. 

const deleteImages = async (req, res) => {
    try {
        const productId = req.params.id;
        let imageIdsToDelete = req.body.images;

        // Verificar si se proporcionaron IDs de imágenes a eliminar y convertirlas a un array si es necesario
        if (!imageIdsToDelete || imageIdsToDelete.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "No se proporcionaron IDs de imágenes para eliminar"
            });
        }

        if (!Array.isArray(imageIdsToDelete)) {
            imageIdsToDelete = [imageIdsToDelete];
        }

        // Actualizar el producto para eliminar las imágenes
        const product = await Product.findByIdAndUpdate(
            productId,
            { $pull: { images: { _id: { $in: imageIdsToDelete } } } },
            { new: true }
        );

        if (!product) {
            // Si el producto no se encuentra, devolver un error
            return res.status(404).json({
                status: "error",
                message: "product not found"
            });
        }

        // Entregar una respuesta con éxito y la información del producto actualizada
        return res.status(200).json({
            status: "success",
            message: "images delete success",
            product: product
        });

    } catch (error) {
        // Manejo de errores
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor"
        });
    }
}

//devolver archivos multimedia
const media = (req, res) => {

    //obtener parametro de la url
    const file = req.params.file

    //montar el path real de la image
    const filePath = "./uploads/products/" + file

    try {
        //comprobar si archivo existe
        fs.stat(filePath, (error, exist) => {
            if (!exist) {
                return res.status(404).send({
                    status: "error",
                    message: "la image no existe"
                })
            }
            //devolver archivo en el caso de existir  
            return res.sendFile(path.resolve(filePath));
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "error al obtener la informacion en servidor"
        })
    }
}

//end-point para buscar Products
const search = async (req, res) => {
    try {
        let busqueda = req.params.product;
        console.log(busqueda)

        busqueda = busqueda.replace(/\+/g, ' ');

        let page = 1
        if (req.params.page) {
            page = req.params.page
        }
        page = parseInt(page)

        let itemPerPage = 5

        const options = {
            page,
            limit: itemPerPage,
            sort: { fecha: -1 },
            select: '-password', // Excluir campos sensibles si es necesario
        };

        const categoria = await Category.findOne({ name: { $regex: busqueda, $options: "i" } });

        let query = {
            $or: [
                { "name": { $regex: busqueda, $options: "i" } },
                { "description": { $regex: busqueda, $options: "i" } },
                { "brand": { $regex: busqueda, $options: "i" } },
            ]
        };

        if (categoria) {
            query.$or.push({ "category": categoria._id });
        }

        const productsInOffer = await Product.aggregate([
            { $match: { $expr: { $and: [{ $ne: ["$offerprice", null] }, { $ne: ["$offerprice", "0"] }, { $ne: ["$offerprice", ""] }] } } },
            { $group: { _id: "$_id" } }
        ]);

        const products = await Product.paginate(query, { _id: { $in: productsInOffer.map(p => p._id) } }, options);


        // Calcular el descuento en porcentaje
        products.docs.forEach(product => {
            const price = parseFloat(product.price);
            const offerprice = parseFloat(product.offerprice);
            const discountPercentage = offerprice ? Math.round(((price - offerprice) / price) * 100) : 0; // Asegúrate de que no haya división por cero
            product.discountPercentage = discountPercentage;
        });

        return res.status(200).json({
            status: "success",
            message: "Búsqueda completada",
            products: products.docs,
            page: products.page,
            totalDocs: products.totalDocs,
            totalPages: products.totalPages,
            itemPerPage: products.limit
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al realizar la búsqueda",
            error: error.message,
        });
    }
};



//end-point para listar todos los Products
const listProduct = async (req, res) => {
    let page = 1
    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    let itemPerPage = 6

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { createdAt: -1 },
        populate: [
            { path: 'category', select: 'name' },
            { path: 'stock', select: 'quantity location' }
        ]
    }

    try {
        const products = await Product.paginate({}, opciones);

        if (!products) return res.status(404).json({
            status: "error",
            message: "no se han encontrado products"
        })



        // Calcular el descuento en porcentaje 
        products.docs.forEach(product => {
            const price = parseFloat(product.price);
            const offerprice = parseFloat(product.offerprice);
            product.discountPercentage = offerprice !== 0 ? parseInt(((price - offerprice) / price) * 100) : 0;

        });


        return res.status(200).send({
            status: "success",
            message: "products encontrados",
            products: products.docs,

            page: products.page,
            totalDocs: products.totalDocs,
            totalPages: products.totalPages,
            itemPerPage: products.limit,

        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los products',
            error: error.message,
        });

    }
}


//end-point para eliminar Produtc
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id;
        console.log(userId)

        // Buscar el producto y verificar si el usuario logueado es el creador
        const productDelete = await Product.findOne({ _id: productId, userId: userId });

        if (!productDelete) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado o no tiene permisos para eliminarlo'
            });
        }

        // Verificar si el usuario logueado es el creador del producto
        if (productDelete.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para eliminar este producto'
            });
        }

        await Product.findByIdAndDelete(productId);

        return res.status(200).json({
            status: 'success',
            message: 'Producto eliminado correctamente',
            productoEliminado: productDelete
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
}

//end-point para modificar product
const updateProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const idProduct = req.params.id;  // Asumiendo que el id se encuentra en los parámetros
        const productUpdate = req.body;

        // Verificar si el producto existe
        const productExist = await Product.findById(idProduct);

        if (!productExist) {
            return res.status(404).json({
                status: 'error',
                message: 'product no fue encontrado'
            });
        }

        // Verificar si el usuario logueado es el creador del producto
        if (productExist.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para modificar este producto'
            });
        }

        // Actualizar el producto con los datos proporcionados
        await Product.findByIdAndUpdate(idProduct, productUpdate, { new: true });

        return res.status(200).json({
            status: 'success',
            message: 'Product actualizado correctamente',
            productExist,
            productUpdate
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

//end-point para mostrar 1 producto - para mostrar o traer 1 producto cuando se haga clic en leer o ver desde el front
const getProduct = async (req, res) => {
    try {
        const idProduct = req.params.id;
        const product = await Product.findById(idProduct).populate([
            { path: 'category', select: 'name' },
            { path: 'stock', select: 'quantity location' }
        ]);

        // Verificar si el producto existe
        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });
        }

        // Calcular el descuento en porcentaje 
        const price = parseFloat(product.price);
        const offerprice = parseFloat(product.offerprice);
        const discountPercentage = offerprice !== 0 ? parseInt(((price - offerprice) / price) * 100) : 0;

        // Agregar el descuento al objeto del producto
        product.discountPercentage = discountPercentage;

        return res.status(200).json({
            status: "success",
            product
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar el producto",
            error: error.message
        });
    }
};


//end-point para listar productos por categorias
const getProductCategory = async (req, res) => {
    let page = 1
    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    let itemPerPage = 6

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { fecha: -1 },
        populate: [
            { path: 'category', select: 'name' },
            { path: 'stock', select: 'quantity location' }
        ]

    }


    try {
        const categoryId = req.params.id;

        // Buscar la categoría por su ID
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                status: "error",
                mensaje: "Categoría no encontrada"
            });
        }

        // Buscar los productos que tengan la categoría encontrada
        const products = await Product.paginate({ category: categoryId }, opciones);

        // Calcular el descuento en porcentaje 
        products.docs.forEach(product => {
            const price = parseFloat(product.price);
            const offerprice = parseFloat(product.offerprice);
            product.discountPercentage = offerprice !== 0 ? parseInt(((price - offerprice) / price) * 100) : 0;

        });

        return res.status(200).json({
            status: "success",
            products: products.docs,
            page: products.page,
            totalDocs: products.totalDocs,
            totalPages: products.totalPages,
            itemPerPage: products.limit,
            categoryName: category.name

        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            mensaje: "Error al buscar los productos de la categoría",
            error: error.message
        });
    }
};

//mas vendidos
const BestSellingProducts = async (req, res) => {
    let page = 1
    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)
    try {
        let page = 1;
        let limit = 10;
        const opciones = {
            page: page,
            limit: limit,
            sort: { fecha: -1 },
            populate: [
                { path: 'category', select: 'name' },
                { path: 'stock', select: 'quantity location' }
            ]
        }

        // Obtener solo los IDs de los productos más vendidos
        const products = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $unwind: "$products" },
            { $group: { _id: "$products.product", totalQuantity: { $sum: "$products.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit * page } // Limitar a los productos más vendidos de todas las páginas
        ]);

        // Obtener los detalles de los productos más vendidos utilizando la paginación de Mongoose
        const bestSellingProducts = await Product.paginate({ _id: { $in: products.map(p => p._id) } }, opciones);

        // Calcular el descuento en porcentaje para cada producto
        bestSellingProducts.docs.forEach(product => {
            const price = parseFloat(product.price);
            const offerprice = parseFloat(product.offerprice);
            product.discountPercentage = offerprice !== 0 ? parseInt(((price - offerprice) / price) * 100) : 0;
        });

        return res.status(200).json({
            status: "success",
            products: bestSellingProducts.docs,
            page: bestSellingProducts.page,
            totalDocs: bestSellingProducts.totalDocs,
            totalPages: bestSellingProducts.totalPages,
            itemPerPage: bestSellingProducts.limit,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener los productos más vendidos",
            error: error.message
        });
    }
};


//obtener productos que estan en oferta(offerprice), 
const offerPrice = async (req, res) => {
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    let itemPerPage = 6;

    const options = {
        page: page,
        limit: itemPerPage,
        sort: { fecha: -1 },
        populate: [
            { path: 'category', select: 'name' },
            { path: 'stock', select: 'quantity location' }
        ]
    };

    try {
        // Obtener solo los IDs de los productos en oferta
        const productsInOffer = await Product.aggregate([
            { $match: { $expr: { $and: [{ $ne: ["$offerprice", "null"] }, { $ne: ["$offerprice", "0"] }, { $ne: ["$offerprice", ""] }] } } },
            { $group: { _id: "$_id" } }
        ]);

        // Obtener los detalles de los productos en oferta utilizando la paginación de Mongoose
        const products = await Product.paginate({ _id: { $in: productsInOffer.map(p => p._id) } }, options);

        if (!products.docs || products.docs.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se han encontrado productos en oferta"
            });
        }

        // Calcular el descuento en porcentaje al vuelo
        products.docs.forEach(product => {
            const price = parseFloat(product.price);
            const offerprice = parseFloat(product.offerprice);
            const discountPercentage = parseInt(((price - offerprice) / price) * 100);
            product.discountPercentage = isNaN(discountPercentage) ? 0 : discountPercentage;
        });

        return res.status(200).send({
            status: "success",
            message: "Productos encontrados",
            products: products.docs,
            page: products.page,
            totalDocs: products.totalDocs,
            totalPages: products.totalPages,
            itemPerPage: products.limit
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los productos en oferta',
            error: error.message,
        });
    }
};



//productos destacados
const featuredProducts = async (req, res) => {
    try {
        let page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page);
        }

        let limit = 10;
        if (req.query.limit) {
            limit = parseInt(req.query.limit);
        }

        const options = {
            populate: [
                { path: 'category', select: 'name' },
                { path: 'stock', select: 'quantity location' }
            ]
        };

        // Obtener solo los IDs de los productos destacados
        const products = await Product.aggregate([
            { $match: { standout: true } },
            { $project: { _id: 1 } }, // Proyectar solo el campo _id
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit * page }
        ]);

        // Obtener los detalles de los productos destacads utilizando la paginación de Mongoose
        const featuredProducts = await Product.paginate({ _id: { $in: products.map(p => p._id) } }, { page, limit, options })

        // Calcular el descuento en porcentaje al vuelo
        featuredProducts.docs.forEach(product => {
            const price = parseFloat(product.price);
            const offerprice = parseFloat(product.offerprice);
            product.discountPercentage = offerprice !== 0 ? parseInt(((price - offerprice) / price) * 100) : 0;

        });

        return res.status(200).json({
            status: "success",
            products: featuredProducts.docs,

            page: featuredProducts.page,
            totalDocs: featuredProducts.totalDocs,
            totalPages: featuredProducts.totalPages,
            itemPerPage: featuredProducts.limit,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener los productos más vendidos",
            error: error.message
        });
    }
};

//listar los productos nombre y cantidad
const listBestSelling = async (req, res) => {
    let page = 1

    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    try {
        let itemPerPage = 2

        const opciones = {
            page: page,
            limit: itemPerPage,
            sort: { lastUpdatedAt: -1 }
        }


        const bestselling = await Bestselling.paginate({}, opciones);

        if (!bestselling || bestselling.docs.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'No se encontró bestselling ',
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Lista de bestselling",
            bestselling: bestselling.docs,
            page: bestselling.page,
            totalDocs: bestselling.totalDocs,
            totalPages: bestselling.totalPages,
            limit: bestselling.limit,
        });


    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener los productos más vendidos",
            error: error.message
        });

    }
}

//end-point para listar el total de ventas por mes
const ventas = async (req, res) => {
    try {
        // Obtener el usuario de la solicitud
        const userId = req.user;

        // Realizar la agregación en la colección Sale para obtener los datos deseados
        const ventasPorMes = await Sale.aggregate([
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    totalVentas: { $sum: "$ventaMensual" },
                    productos: { 
                        $addToSet: { 
                            nombreProducto: "$products.product",
                            cantidad: { $sum: "$products.quantity" }
                        }
                    }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 } // Ordenar por año y mes descendente
            }
        ]);

        return res.status(200).json({
            status: "success",
            message: "Total de ventas por mes",
            ventasPorMes: ventasPorMes
        });
        
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener las ventas",
            error: error.message
        });
    }
};










module.exports = {
    createProduct,
    upload,
    media,
    deleteImages,
    search,
    listProduct,
    deleteProduct,
    updateProduct,
    getProduct,
    getProductCategory,
    BestSellingProducts,
    offerPrice,
    featuredProducts,
    listBestSelling,
    ventas
}