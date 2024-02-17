const fs = require("fs")
const path = require("path")
const validarProduct = require("../helpers/validateProduct")
const Product = require("../models/product")
const Category = require("../models/category")
const Stock = require("../models/stock")
const mongoosePagination = require('mongoose-paginate-v2')
const User = require("../models/user")



//end-point para crear Products
const createProduct = async (req, res) => {
    const params = req.body;
    console.log(params)

    if (!params.name || !params.description || !params.brand || !params.size || !params.price || !params.category) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar",
        });
    }

    try {
        const userId = req.user.id;
        console.log(userId)
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

        });

        await newProduct.save();

        return res.status(200).json({
            status: "success",
            message: "producto creado de forma correcta",
            newProduct,
        });
    } catch (error) {
        console.error(error);

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


//end-point para eliminar una o varias imagenes. se identifica por id de la imagen 
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

        // Utilizar expresiones regulares para realizar una búsqueda insensible a mayúsculas y minúsculas
        const resultados = await Product.paginate({
            $or: [
                { "name": { $regex: busqueda, $options: "i" } },
                { "description": { $regex: busqueda, $options: "i" } },
                { "brand": { $regex: busqueda, $options: "i" } },
            ]
        }, options);

        return res.status(200).json({
            status: "success",
            message: "Búsqueda completada",
            resultados: resultados.docs,
            page: resultados.page,
            totalDocs: resultados.totalDocs,
            totalPages: resultados.totalPages,
            itemPerPage: resultados.limit


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
        sort: { fecha: -1 },
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



        if (!product) {
            return res.status(404).json({
                status: "error",
                mensaje: "producto no encontrado"
            });
        }

        return res.status(200).json({
            status: "success",
            product
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            mensaje: "Error al buscar el producto",
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
    getProduct
}