
const nodemailer = require('nodemailer');

// Función para enviar correo de recuperación utilizando servidor SMTP

async function enviarCorreoRecuperacion(email, nuevaContrasena) {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser, // Cambia con tu dirección de correo de tu servidor 
            pass: emailPassword // Cambia con tu contraseña
        }
    });

    const mailOptions = {
        from: emailUser, // Cambia con tu dirección de correo de servidor
        to: email,
        subject: 'Recuperación de Contraseña',
        text: `Tu nueva contraseña temporal es: ${nuevaContrasena}. Te recomendamos cambiarla una vez hayas iniciado sesión.`
    };

    await transporter.sendMail(mailOptions);
}

//funcion para enviar correo de nueva clave administrador 
async function enviarCorreoBienvenida(email, nuevaContrasena) {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser, // Cambia con tu dirección de correo de tu servidor 
            pass: emailPassword // Cambia con tu contraseña
        }
    });

    const mailOptions = {
        from: emailUser, // Cambia con tu dirección de correo de tu servidor
        to: email,
        subject: 'Bienvenido',
        text: `Tu contraseña temporal es: ${nuevaContrasena}. Te recomendamos cambiarla una vez hayas iniciado sesión.`
    };

    await transporter.sendMail(mailOptions);
}


// Función para enviar correo de confirmacion de compra con numero de orden
async function enviarCorreoConfirmacion(email, orderNumber) {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser,
            pass: emailPassword
        }
    });


    const mailOptions = {
        from: emailUser,
        to: email,
        subject: '¡Tu orden ha sido generada correctamente!',
        html: `
            <h1>¡Tu orden ha sido generada correctamente!</h1>
            <p>Tu número de orden es: <strong>${orderNumber}</strong>.</p>
            <p>Puedes hacer seguimiento de tu pedido en <a href="http://localhost:5173/seguimiento">http://localhost:5173/seguimiento</a>.</p>
            <div>
                <img src="https://blogapi.comogasto.com/api/articulo/media/articulo-1711754612310-tiendagaston.jpeg" alt="Banner de promoción" style="max-width: 100%; height: auto;">
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
}


module.exports = {
    enviarCorreoRecuperacion,
    enviarCorreoBienvenida,
    enviarCorreoConfirmacion
};