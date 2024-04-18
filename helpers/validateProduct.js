const validator = require("validator");

const validar = (params) => {
    let errores = [];

    if (validator.isEmpty(params.name) || !validator.isLength(params.name, { min: 3, max: undefined })) {
        errores.push("El campo 'name' no cumple con los requisitos de longitud.");
    }
    if (/^[a-zA-ZñÑ0-9\s]+$/.test(params.name)) {
        errores.push("El campo 'name' no debe contener caracteres especiales.");
    }

    if (validator.isEmpty(params.brand) || !validator.isLength(params.brand, { min: 3, max: undefined })) {
        errores.push("El campo 'brand' no cumple con los requisitos de longitud.");
    }

    if (validator.isEmpty(params.size) || !validator.isLength(params.size, { min: 1, max: undefined })) {
        errores.push("El campo 'size' no cumple con los requisitos de longitud.");
    }

    if (validator.isEmpty(params.description) || !validator.isLength(params.description, { min: 3, max: undefined })) {
        errores.push("El campo 'descripcion' no cumple con los requisitos de longitud.");
    }

    if (validator.isEmpty(params.price) || !validator.isNumeric(params.price, { min: 3, max: undefined })) {
        errores.push("El campo 'contenido' no cumple con los requisitos de longitud.");
    }

    if (errores.length > 0) {
        throw new Error(`No se ha superado la validación. Errores: ${errores.join(", ")}`);
    } else {
        console.log("Validación superada.");
    }
}

module.exports = {
    validar
}
