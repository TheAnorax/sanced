const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

const getTransportistas = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM transportista`;
    try {
        const [transportistas] = await pool.query(SQL_QUERY, (err, resutl) => {
            
           res.json(transportistas);
        })
    } catch (error) {
        res.status(500).json({message: 'Error al obtener los transportistas'})
    }
}

const createTransportista = async (req, res) => {
    const { id_catv, nombre, empresa, registro, telefono, est, no_licencia, no_ine, marca, modelo, placa, anio, seguro } = req.body;
    const foto = req.file ? req.file.filename : null;

    if (!id_catv || !nombre || !empresa || !registro) {
        return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const fechaRegistro = new Date(registro);
    const dia = fechaRegistro.getDate().toString().padStart(2, '0');

    const SQL_INSERT_VISITA = `
        INSERT INTO transportista (id_catv, nombre, empresa, telefono, foto, no_licencia, no_ine, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE = `UPDATE transportista SET clave = ? WHERE id_transp = ?`;
    const SQL_INSERT_VEHICULO = `
        INSERT INTO vehiculos (clave_duenio, marca, modelo, placa, anio, seguro)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const conexion = pool;

    try {
        const [transportista] = await conexion.query(SQL_INSERT_VISITA, [
            id_catv, nombre, empresa, telefono, foto, no_licencia, no_ine, registro, est,
        ]);
        const id_persona = transportista.insertId;

        const clavePersonalizada = `TR${dia}${id_persona}`;
        await conexion.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);

        if (no_licencia) {
            await conexion.query(SQL_INSERT_VEHICULO, [
               clavePersonalizada, marca, modelo, placa, anio, seguro,
            ]);
        }

        res.json({ message: `Registro exitoso con clave: ${clavePersonalizada}` });
    } catch (error) {
        if (foto) {
            fs.unlink(path.join('C:/acc-ced', foto), (err) => {
                if (err) console.error("Error al eliminar el archivo:", err);
            });
        }
        console.error('Error al registrar transportista:', error);
        res.status(500).json({ message: 'Error al registrar', error: error.message });
    }
};


module.exports = { createTransportista, getTransportistas }