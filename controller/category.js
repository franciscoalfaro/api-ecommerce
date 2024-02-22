//importar modulos
const mongoosePagination = require('mongoose-paginate-v2')

//importar modelo
const User = require("../models/user")
const Category = require("../models/category")
const Product = require("../models/product")

const createCategory = async (req, res) => {
    let params = req.body;

    if (!params.name) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        // Obtener el userId del usuario autenticado desde el token
        const userId = req.user.id;

        // Comprobar si la categoría ya existe por su nombre para el usuario actual
        const categoryExists = await Category.findOne({ name: params.name, userId: userId });

        if (categoryExists) {
            return res.status(409).json({
                status: "error",
                message: "La categoría ya existe para este usuario"
            });
        }

        // Si la categoría no existe para el usuario actual, crearla asociada a ese usuario
        const newCategory = await Category.create({
            name: params.name,
            userId: userId // Asociar la categoría al usuario actual
        });

        return res.status(201).json({
            status: "success",
            message: "Categoría creada correctamente",
            categoria: newCategory
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al crear la categoría",
            error: error.message
        });
    }
}

//delete category
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const userId = req.user.id; // Obtener el ID del usuario autenticado desde el token

        // Buscar la categoría por su ID y el usuario que la creó
        const categoryDelete = await Category.findOne({ _id: categoryId, userId: userId });

        if (!categoryDelete) {
            return res.status(404).json({
                status: 'error',
                message: 'La categoría no fue encontrada o no tiene permisos para eliminarla'
            });
        }

        // Encontrar la categoría predeterminada (por ejemplo, "Sin Categoría") asociada al usuario
        let categoriaPredeterminada = await Category.findOne({ name: 'Sin Categoría', userId: userId });

        // Si no se encuentra la categoría predeterminada, crearla asociada al usuario
        if (!categoriaPredeterminada) {
            categoriaPredeterminada = await Category.create({ name: 'Sin Categoría', userId: userId });
        }

        // Actualizar los gastos asociados a la categoría que se eliminará
        await Product.updateMany({ category: categoryId, userId: userId }, { category: categoriaPredeterminada._id });

        // Eliminar la categoría asociada al usuario
        await Category.findByIdAndDelete(categoryId);

        return res.status(200).json({
            status: 'success',
            message: 'Categoría eliminada correctamente'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar la categoría',
            error: error.message
        });
    }
};

//update category
const updateCategory = async (req, res) => {
    const { id } = req.params; // ID de la categoría
    const { name } = req.body; // Nuevos datos de la categoría

    try {
        // Buscar la categoría por su nombre
        const categoryExists = await Category.findOne({ name });


        // Si existe una categoría con el mismo nombre y un ID diferente al de la categoría que se está actualizando
        if (categoryExists && categoryExists._id.toString() !== id) {
            return res.status(409).json({
                status: 'error',
                message: 'El nombre de la categoría ya existe'
            });
        }

        // Actualizar la categoría por su ID
        const categoryUpdate = await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        if (!categoryUpdate) {
            return res.status(404).json({
                status: 'error',
                message: 'La categoría no fue encontrada'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Categoría actualizada correctamente',
            category: categoryUpdate
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la categoría',
            error: error.message
        });
    }
};


//list categorias de productos esto para el usuario que administra
const listCategorys = async (req, res) => {
    const userId = req.user.id; // Suponiendo que tienes el ID del usuario en el token
    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemPerPage = 4;

    try {
        const options = {
            page: page,
            limit: itemPerPage,
            
        };
        // Buscar todas las categorías asociadas al usuario
        const categorys = await Category.paginate({ userId},options );

        return res.status(200).json({
            status: 'success',
            message: 'Categorías encontradas',
            categorias:categorys.docs,
            totalPages: categorys.totalPages,
            totalCategories: categorys.totalCategoria,
            itempage: categorys.limit,
            page: categorys.page,
            totalDocs:categorys.totalDocs
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar las categorías',
            error: error.message
        });
    }
};

//
const listCategorysDrop = async (req, res) => {

    try {

        // Buscar todas las categorías asociadas al usuario
        const categorys = await Category.paginate();

        return res.status(200).json({
            status: 'success',
            message: 'Categorías encontradas',
            categorys:categorys.docs
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar las categorías',
            error: error.message
        });
    }
};


module.exports={
    createCategory,
    deleteCategory,
    updateCategory,
    listCategorys,
    listCategorysDrop

}