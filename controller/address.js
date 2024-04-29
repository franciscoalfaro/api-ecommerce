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
   

        if (!params.direccion || !params.numero || !params.nombre || !params.phone || !params.region || !params.ciudad || !params.comuna) {
            return res.status(400).json({
                status: "Error",
                message: "Faltan datos por enviar",
            });
        }

        // Verificar si la dirección ya existe para el usuario
        const existsAddress = await Address.findOne({ direccion: params.direccion, userId: userId });

        if (existsAddress) {
            if (existsAddress.eliminado === true) {
                // Si la dirección existe pero está marcada como eliminada, actualizar el estado de eliminado a falso
                await Address.findByIdAndUpdate(existsAddress._id, { eliminado: false });
        
                return res.status(200).json({
                    status: "success",
                    message: "La dirección existente fue marcada como no eliminada",
                    address: existsAddress
                });
            } else {
                // Si la dirección existe y no está marcada como eliminada, devolver un error
                return res.status(400).json({
                    status: "error",
                    message: "La dirección ya existe"
                });
            }
        }



        // Crear la dirección
        const newAddress = await Address.create({
            userId: userId,
            direccion: params.direccion,
            nombre:params.nombre || 'default',
            numero: params.numero,
            phone:params.phone,
            codigoPostal: params.codigoPostal   || '',
            region: params.region,
            ciudad: params.ciudad,
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
       

        // Buscar la red y verificar si el usuario logueado es el creador
        //const addresDelete = await Address.findOne({ _id: addressId, userId: userId });

        const addresDelete = await Address.findByIdAndUpdate( {_id: addressId, userId: userId});
        

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

        const addresEliminada = await Address.findByIdAndUpdate(addressId, { eliminado: true });

        return res.status(200).json({
            status: 'success',
            message: 'Direccion eliminada correctamente',
            redEliminada: addresEliminada
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
    const { id } = req.params; // ID de la dirección a actualizar
    const UserId = req.user.id; // ID del usuario autenticado
  
    
    const { direccion, nombre,phone, numero, region, codigoPostal, ciudad, comuna } = req.body; // Nuevos datos de la dirección 

    try {
        // Buscar la dirección por su ID
        const existingAddress = await Address.findById(id);
        if (!existingAddress) {
            return res.status(404).json({
                status: 'error',
                message: 'La dirección no existe',
            });
        }
      

        // Verificar si el usuario autenticado es el propietario de la dirección
        if (existingAddress.userId.toString() !== UserId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permiso para actualizar esta dirección',
            });
        }

        // Verificar si la dirección ya está siendo utilizada por otra dirección
        const existsAddress = await Address.findOne({ direccion, _id: { $ne: id } });
        if (existsAddress) {
            return res.status(409).json({
                status: 'error',
                message: 'La dirección ya está siendo utilizada, verifica la información',
            });
        }

        // Actualizar la dirección
        const addressUpdates = await Address.findByIdAndUpdate(
            id,
            { direccion, nombre, numero,phone, codigoPostal, region, ciudad, comuna },
            { new: true }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Dirección actualizada correctamente',
            addressUpdates,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la dirección',
            error: error.message,
        });
    }
};


//este end-poit es para listar direcciones del usuario logueado
const listAddress = async (req, res) => {
    const userId = req.user.id; // Obtener el ID del usuario autenticado desde el token
    
    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemPerPage = 3;

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 },
        select: ("-password -email -role -__v"),

    };

    try {
        // Filtrar la direccion por el ID del usuario y por el eliminado false
        const address = await Address.paginate({ userId: userId, eliminado:false }, opciones);

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
