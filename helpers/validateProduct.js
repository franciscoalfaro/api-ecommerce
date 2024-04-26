const validator = require("validator");

const validar = (params) => {
    let errores = [];

    if (validator.isEmpty(params.name) || !validator.isLength(params.name, { min: 3, max: undefined })) {
        errores.push("El campo 'name' no cumple con los requisitos de longitud.");
    }

    if (validator.isEmpty(params.brand) || !validator.isLength(params.brand, { min: 3, max: undefined })) {
        errores.push("El campo 'brand' no cumple con los requisitos de longitud.");
    }

    if (validator.isEmpty(params.gender) || !validator.isLength(params.gender, { min: 3, max: undefined })) {
        errores.push("El campo 'gender' no cumple con los requisitos de longitud.");
    }


    if (validator.isEmpty(params.size) || !validator.isLength(params.size, { min: 1, max: undefined })) {
        errores.push("El campo 'size' no cumple con los requisitos de longitud.");
    }

    if (validator.isEmpty(params.description) || !validator.isLength(params.description, { min: 3, max: 200 })) {
        errores.push("El campo 'descripcion' no cumple con los requisitos de longitud.");
    }

    if (validator.isEmpty(params.additionalInformation) || !validator.isLength(params.additionalInformation, { min: 3, max: undefined })) {
        errores.push("El campo 'informacion adicional' no cumple con los requisitos de longitud.");
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
