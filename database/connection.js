const mongoose = require('mongoose');
require('dotenv').config();

const connection  = async () => {
    try {
        let mongoURI;

        // Verifica si estamos en un entorno de producción
        if (process.env.NODE_ENV === 'production') {
            // Si es producción, utiliza la variable de entorno para la URI de MongoDB de producción
            mongoURI = process.env.PROD_MONGODB_URI;
        } else {
            // Si no es producción, utiliza la variable de entorno para la URI de MongoDB de desarrollo
            mongoURI = process.env.DEV_MONGODB_URI;
        }

        await mongoose.connect(mongoURI);
        console.log("Conexión exitosa a la base de datos");

    } catch (error) {
        console.error("Error de conexión a la base de datos:", error);
        console.log('Intentando nuevamente la conexión en 2 segundos...');
        setTimeout(connection , 2000);
    }
}

module.exports = {
    connection 
}
