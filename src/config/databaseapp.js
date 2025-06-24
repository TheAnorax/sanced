// config/database.js
const mysql = require('mysql2/promise');
const Respuesta = require('../modelaplication/Respuesta.js');

const pool1 = mysql.createPool({
    host: '66.232.105.87',
    user: 'root',
    password: '',
    database: 'savawms',
    connectTimeout: 60000,
});

async function listar(query, tablas = false){
    let respuesta = new Respuesta();
    
    try {
        // Obtener una conexión del pool
        const connection = await pool1.getConnection();

        try {
            // Ejecutar la consulta
            const [filas] = await connection.query(query);
            
            // Verificar el resultado antes de parsear como JSON
            const resultadoSQL = !tablas ? JSON.parse(filas[0][0]['@res']) : JSON.parse(filas[0]['@res']);

            if (typeof resultadoSQL === 'string') {
                try {
                    respuesta.resultado = JSON.parse(resultadoSQL);
                } catch (jsonError) {
                    throw new Error("Error al parsear JSON: " + jsonError.message);
                }
            } else {
                respuesta.resultado = resultadoSQL;
            }

            connection.release(); // Liberar la conexión

            return respuesta;

        } catch (error) {
            // Manejar errores en la consulta
            connection.release(); // Asegurar que se libere la conexión en caso de error
            respuesta.exito = false;
            respuesta.estado = "400";
            respuesta.mensaje = error.sqlMessage === undefined ? error.message : error.sqlMessage;
            return respuesta;
        }
    } catch (ex) {
        // Manejar errores en la conexión
        respuesta = { 
            exito: false,
            estado: 400,
            mensaje: 'Error mysql: ' + ex.message,
            resultado: []
        };
        return respuesta;
    }
}

module.exports = {
    listar,
    pool1
};