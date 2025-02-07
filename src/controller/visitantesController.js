const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join( 'C:/acc-ced'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

//app.use('/fotos', express.static('C:/acc-ced/'));

const getVisitantes = async (req, res) => {
    const SQL_QUERY_VISITANTES = `
        SELECT visitantes.id_vit, visitantes.nombre, visitantes.clave, categorias_visitas.tipo AS categoria
        FROM visitantes
        JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
    `;

    const SQL_QUERY_TRANSPORTISTA = `
        SELECT transportista.id_transp, transportista.nombre, transportista.clave, categorias_visitas.tipo AS categoria
        FROM transportista
        JOIN categorias_visitas
        ON transportista.id_catv = categorias_visitas.id_catv
    `;

    try {
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);

        res.json({
            visitantes: resultVisitantes,
            transportistas: resultTransportistas,
        });
    } catch (error) {
        console.error('Error en las consultas:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
   
}

const getVisitanteId = async (req, res) => {
    const { id_vit } = req.params.id;
    const SQL_QUERY = 'SELECT * FROM visitantes WHERE clave_vit = ?'
    try {
        const [rows] = await pool.query(SQL_QUERY, [id_vit]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Visita no encontrado" });
          }
      
        res.json(rows);
    } catch (error) {
        res.status(500).json({error: 'Error al obtener la visita.'});
    }
}

const createVisitante = async (req, res) => {
    //console.log('Cuerpo de la solicitud:', req.body);
    const { id_catv, nombre, empresa, registro, telefono, est, no_licencia, no_ine, marca, modelo, placa, anio, seguro } = req.body;
    const foto = req.file ? req.file.filename : null;

    const fechaRegistro = new Date(registro);
    const dia = fechaRegistro.getDate().toString().padStart(2, '0');

    const SQL_INSERT_VISITA = `
        INSERT INTO visitantes (id_catv, nombre, empresa, telefono, foto, no_licencia, no_ine, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE = `UPDATE visitantes SET clave = ? WHERE id_vit = ?`;
    const SQL_INSERT_VEHICULO = `
        INSERT INTO vehiculos (clave_duenio, marca, modelo, placa, anio, seguro)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        const [insertPersonResult] = await pool.query(SQL_INSERT_VISITA, [
            id_catv, nombre, empresa, telefono, foto, no_licencia, no_ine, registro, est,
        ]);
        
        const id_persona = insertPersonResult.insertId; 

        const clavePersonalizada = `VT${dia}${id_persona}`;

        await pool.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);

        if (no_licencia) {
            await pool.query(SQL_INSERT_VEHICULO, [
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

        console.error('Error al registrar visitante:', {
            error: error.message,
            stack: error.stack,
        });
        res.status(500).json({ message: 'Error al registrar', error: error.message });
    }
};





module.exports = {createVisitante, getVisitantes, getVisitanteId, upload};