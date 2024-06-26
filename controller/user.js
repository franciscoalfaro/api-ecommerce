//importar dependencias y modulos
const fs = require("fs")
const bcrypt = require("bcrypt")
const mongoosePagination = require('mongoose-paginate-v2')
const path = require("path")

const enviar = require("../middlewares/recuperarpass")
const nuevaclave = require("../services/generatepassword")
const nikc = require("../services/randomnick")

// importar modelo
const User = require("../models/user")

//importar servicio
const validate = require("../helpers/validate")
const jwt = require("../services/jwt")
// end-point


//register
const register = async (req, res) => {
    try {
        // Recoger datos de la petición
        let params = req.body;

        // Comprobar datos + validación
        if (!params.name || !params.nick || !params.email || !params.password) {
            return res.status(400).json({
                status: "error",
                message: "faltan datos por enviar"
            });
        }

        // Validar los datos
        try {
            validate.validate(params);
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: "Validacion no superada",
            });
        }

        // Consultar si usuario existe en la BD para ser guardado, en el caso de existir indicará que el nick y correo ya existen
        const users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() },
            ],
        });

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "warning",
                message: "El usuario ya existe",
            });
        }

        // Cifrar la contraseña con bcrypt
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Crear objeto de usuario para guardar en la BD
        let user_to_save = new User(params);

        // Guardar usuario en la BD
        const userStored = await user_to_save.save();

        
        // Devolver el resultado
        return res.status(201).json({
            status: "success",
            message: "Usuario registrado correctamente",
            user: userStored,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "error", message: "error al guardar el usuario" });
    }
};

const createUser = async (req, res) => {
    try {
        const { email, name, surname, role } = req.body;
        console.log(req.body)

        // Verificar si el usuario tiene el rol de administrador
        const userRole = req.user.role;
        const allowedRoles = ['root', 'administrador', 'admin'];
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                status: "error",
                message: "No tiene permisos para crear usuarios"
            });
        }

        // Validar datos de entrada
        if (!email || !name || !surname || !role) {
            return res.status(400).json({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Verificar si el usuario ya existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({
                status: "warning",
                message: "El usuario ya existe"
            });
        }

        // Crear una contraseña aleatoria para el nuevo usuario
        const nuevaContrasena = nuevaclave.generarNuevaContrasena();
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Crear el nuevo usuario
        const nickRandom = nikc.generateRandomNick(8); // Suponiendo que esta función genera un nick aleatorio
        user = new User({
            name,
            surname,
            role,
            nick: nickRandom,
            email,
            password: hashedPassword
        });

        // Guardar el nuevo usuario en la base de datos
        const userCreado = await user.save();

        // Enviar correo de bienvenida con la nueva contraseña
        await enviar.enviarCorreoBienvenida(email, nuevaContrasena);

        
        delete user.password;
        console.log("Usuario creado sin contraseña:", userCreado);

        if (userCreado) {
            userCreado.password = delete userCreado.password; // O puedes usar delete userCreado.password;
        }

        
        
        // Devolver el resultado
        return res.status(201).json({
            status: "success",
            message: "Usuario creado correctamente",
            userCreado
        });
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        return res.status(500).json({
            status: "error",
            message: "Error al crear el usuario",
            error: error.message
        });
    }
}


//Login de usuario
const login = async (req, res) => {
    try {
        let params = req.body;

        if (!params.email || !params.password) {
            return res.status(400).send({
                status: "error_404",
                message: "faltan datos por enviar"
            });
        }

        const user = await User.findOne({ email: params.email });

        if (!user) {
            return res.status(404).json({
                status: "Not Found",
                message: "Usuario no registrado"
            });
        }

        const pwd = bcrypt.compareSync(params.password, user.password);

        if (!pwd) {
            return res.status(400).send({
                error: "error_pass",
                message: "usuario o clave incorrectos."
            });
        }

        user.eliminado = false;
        await user.save();

        const token = jwt.createToken(user);

        return res.status(200).json({
            status: "success",
            message: "Te has identificado de forma correcta",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick,
                role: user.role
            },
            token,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" });
    }
};


// perfil
const profile = async (req, res) => {
    try {
        const id = req.params.id;
        const userProfile = await User.findById(id).select({ "password": 0 });

        if (!userProfile) {
            return res.status(404).json({
                status: "error",
                message: "NO SE HA ENCONTRADO EL USUARIO"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "profile found successfully",
            user: userProfile
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" });
    }
};


//listar usuarios
const list = (req, res) => {
    let page = 1

    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    let itemPerPage = 6

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 },
        select: ("-password -email -role -__v")
    }

    try {
        User.paginate({}, opciones, async (error, users) => {

            if (error || !users) return res.status(404).json({ status: "error", message: "NO SE HA ENCONTRADO EL USUARIO" })

            return res.status(200).send({
                status: "success",
                message: "listado de usuarios",
                users: users.docs,
                pages: users.totalPages,
                totalDocs: users.totalDocs,
                itempage: users.limit,
                page: users.page,

            })

        })

    } catch (error) {
        if (error) return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" })
        console.log(error);

    }
}

//actualizar datos del usuario
const update = async (req, res) => {
    try {
        const userIdentity = req.user;
        let userToUpdate = req.body;

        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;
        delete userToUpdate.image;

        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() },
            ],
        });

        if (!users || users.length === 0) {
            return res.status(500).send({ status: "error", message: "no existe el usuario a actualizar" });
        }

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "warning",
                message: "El usuario ya existe"
            });
        }

        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        } else {
            delete userToUpdate.password;
        }

        let userUpdate = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });

        if (!userUpdate) {
            return res.status(400).json({ status: "error", message: "error al actualizar" });
        }

        return res.status(200).json({
            status: "success",
            message: "profile update success",
            user: userToUpdate
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "error al obtener la informacion en servidor"
        });
    }
};


const avatar = (req, res) => {

    //obtener parametro de la url
    const file = req.params.file

    //montar el path real de la image
    const filePath = "./uploads/avatars/" + file

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

//subida de image
const upload = async (req, res) => {
    //recoger el fichero de image
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "imagen no seleccionada"
        })
    }

    //conseguir nombre del archivo
    let image = req.file.originalname

    //obtener extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1].toLowerCase();

    //comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        //borrar archivo y devolver respuesta en caso de que archivo no sea de extension valida.
        const filePath = req.file.path
        const fileDelete = fs.unlinkSync(filePath)

        //devolver respuesta.        
        return res.status(400).json({
            status: "error",
            mensaje: "Extension no invalida"
        })

    }

    try {
        const ImaUpdate = await User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })

        if (!ImaUpdate) {
            return res.status(400).json({ status: "error", message: "error al actualizar" })
        }
        //entrega respuesta corrrecta de image subida
        return res.status(200).json({
            status: "success",
            message: "avatar actualizado",
            user: req.user,
            file: req.file,
            image
        });
    } catch (error) {
        if (error) {
            const filePath = req.file.path
            const fileDelete = fs.unlinkSync(filePath)
            return res.status(500).send({
                status: "error",
                message: "error al obtener la informacion en servidor",
            })
        }

    }

}

//eliminar usuario/cuenta
const remove = async (req, res) => {
    try {
        // Obtener el ID del usuario
        const userId = req.params.id;

        // Eliminacion del usuario de forma logica - se modifica el modelo para agregar el campo eliminado por defecto en false
        const userDelete = await User.findByIdAndUpdate(userId, { eliminado: true });


        if (userDelete) {
            return res.status(200).json({
                status: "success",
                message: "Usuario eliminado",
                user: userDelete
            });
        } else {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al eliminar usuario",
            error: error.message
        });
    }
}




module.exports = {
    register,
    login,
    profile,
    list,
    update,
    avatar,
    upload,
    remove,
    createUser,
}