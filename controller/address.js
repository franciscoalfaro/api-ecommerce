//importar modelos
const Address = require("../models/address");
const User = require("../models/user");

//importar mongoose pagination
const mongoosePagination = require('mongoose-paginate-v2')


//end-point para crear direcciones
const createAddress = async (req, res) => {
    try {
        const params = req.body;
        const userId = req.user.id;
        console.log(params)

        if (!params.direccion || !params.numero || !params.region || !params.cuidad || !params.comuna) {
            return res.status(400).json({
                status: "Error",
                message: "Faltan datos por enviar",
            });
        }

        // Verificar si la dirección ya existe para el usuario
        const existsAddress = await Address.findOne({ direccion: params.direccion, userId: userId });
        if (existsAddress) {
            return res.status(400).json({
                status: "error",
                message: "La dirección ya existe"
            });
        }

        // Crear la dirección
        const newAddress = await Address.create({
            userId: userId,
            direccion: params.direccion,
            numero: params.numero,
            codigoPostal: params.codigoPostal   || '',
            region: params.region,
            cuidad: params.cuidad,
            comuna: params.comuna
        });

        return res.status(200).json({
            status: "success",
            message: "Dirección guardada correctamente",
            newAddress,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Error al crear la dirección",
            error: error.message || "Error desconocido",
        });
    }
};

//end-point para eliminar direcciones
const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.user.id;
        console.log(userId)

        // Buscar la red y verificar si el usuario logueado es el creador
        const addresDelete = await Address.findOne({ _id: addressId, userId: userId });

        if (!addresDelete) {
            return res.status(404).json({
                status: 'error',
                message: 'Direccion no encontrado o no tiene permisos para eliminarlo'
            });
        }

        // Verificar si el usuario logueado es el creador de la red
        if (addresDelete.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para eliminar esta direccion'
            });
        }

        await Address.findByIdAndDelete(addressId);

        return res.status(200).json({
            status: 'success',
            message: 'Direccion eliminada correctamente',
            redEliminada: addresDelete
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar la direccion',
            error: error.message
        });
    }
}

//end-point para actualizar direcciones
const updateAddress = async (req, res) => {
    const { id } = req.params; // ID de la red a actualizar
    const { direccion , numero , region , codigoPostal , cuidad , comuna } = req.body; // Nuevos datos de la red 

    try {

        // Buscar la red por su ID

        const existsAddress = await Address.findOne({ direccion });
  
        if (existsAddress && existsAddress._id.toString() !== id) {
            return res.status(409).json({
                status: 'error',
                message: 'la direccion ya esta siendo utilizado verifica la informacion'
            });
        }

        const addressUpdates = await Address.findByIdAndUpdate(
            id,
            {direccion , numero,codigoPostal ,region ,cuidad ,comuna },
            { new: true }
        );

        return res.status(200).json({
            status: 'success',
            message: 'address Updates correctamente',
            addressUpdates
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la red',
            error: error.message
        });
    }

}

//este end-poit es para listar direcciones del usuario logueado
const listAddress = async (req, res) => {
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
        const address = await Address.paginate({ userId: userId }, opciones);

        if (!address || address.docs.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró direcciones para este usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Listado de direcciones del usuario",
            address:address.docs,
            totalDocs:address.totalDocs,
            totalPages:address.totalPages,
            limit:address.limit,
            page:address.page,


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
    createAddress,
    deleteAddress,
    updateAddress,
    listAddress
};
