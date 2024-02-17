// importar modulos 

const jwt = require("jwt-simple")
const moment = require("moment")


//importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret_key;

//Middleware de autencicacion

exports.auth =(req,res,next)=>{

//comprobar cabeza de autenticacion
if(!req.headers.authorization){
    return res.status(403).send({
        status:"error",
        message:"La peticion no tiene cabecera de autenticacion."
    })
}

//limpiar token
let token = req.headers.authorization.replace(/['"]+/g, '');

//decode token

try {
    let payload = jwt.decode(token,secret)

    //comprobar expiracion de token
    if(payload.exp<= moment().unix()){
        return res.status(401).send({
            status:"error",
            message:"token expirado"      
        })

    }
    //agregar datos de usuario a request
    req.user = payload;
    
} catch (error) {
    return res.status(404).send({
        status:"error",
        message:"token invalido"
    })
    
}



//pasara ejecucion de accion
next()


}



