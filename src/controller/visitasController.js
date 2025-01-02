
const pool = require('../config/database');

const getVisitas = async (req, res) => {
    const SQL_QUERY_VISITANTES = `
        SELECT 
            visitantes.id_vit,
            visitantes.id_catv,
            visitantes.nombre,  
            visitantes.empresa, 
            visitantes.foto,
            visitantes.clave,
            visitas.reg_entrada, 
            visitas.reg_salida,
            visitas.hora_entrada,
            visitas.area_per,
            visitas.id_visit,
            visitas.id_vit,
            visitas.est,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nom_com,
            categorias_visitas.id_catv,
            categorias_visitas.tipo
        FROM visitas
        JOIN visitantes ON visitas.id_vit = visitantes.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_duenio
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
        WHERE DATE(visitas.reg_entrada) = CURRENT_DATE
            AND visitas.reg_salida IS NULL
    `;

    const SQL_QUERY_TRANSPORTISTA = `
        SELECT 
            transportista.id_transp,
            transportista.id_catv,
            transportista.nombre,  
            transportista.empresa, 
            transportista.foto,
            transportista.clave,
            visitas.reg_entrada, 
            visitas.reg_salida,
            visitas.hora_entrada,
            visitas.area_per,
            visitas.id_visit,
            visitas.id_vit,
            visitas.est,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nom_com,
            categorias_visitas.id_catv,
            categorias_visitas.tipo
        FROM visitas
        JOIN transportista ON visitas.id_vit = transportista.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_duenio
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
        WHERE DATE(visitas.reg_entrada) = CURRENT_DATE
            AND visitas.reg_salida IS NULL
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
};


const createVisita = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { reg_entrada, hora_entrada, id_vit, motivo, area_per, personal, nom_com } = req.body;

    const SQL_CHECK_VISIT = `
        SELECT 1 
        FROM visitas 
        WHERE id_vit = ? 
        AND DATE(reg_entrada) = DATE(?)
    `;
    const SQL_INSERT_VISIT = `
        INSERT INTO visitas (id_vit, reg_entrada, hora_entrada, motivo, area_per, personal)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const SQL_INSERT_ACOMPANANTES = `
        INSERT INTO acomp (nom_com, id_vit, id_visit ) 
        VALUES ?
    `;

    try {
        const [checkResult] = await pool.query(SQL_CHECK_VISIT, [id_vit, reg_entrada]);
        if (checkResult.length > 0) {
            return res.status(404).json({
                success: false,
                error: 'Este invitado ya tiene una visita registrada para la fecha indicada.',
            });
        }

        const [insertResult] = await pool.query(SQL_INSERT_VISIT, [id_vit, reg_entrada, hora_entrada, motivo, area_per, personal]);
        const visitaId = insertResult.insertId;

        if (nom_com && nom_com.length > 0) {
            const values = nom_com.map(nombre => [nombre, visitaId, id_vit]);
            await pool.query(SQL_INSERT_ACOMPANANTES, [values]);

            return res.json({
                success: true,
                message: 'Visita y acompañantes registrados correctamente.',
                data: { id_vit: visitaId, reg_entrada, hora_entrada, motivo, area_per, personal, nom_com },
            });
        }

        return res.json({
            success: true,
            message: 'Visita registrada correctamente sin acompañantes.',
            data: { id_vit: visitaId, reg_entrada, hora_entrada, motivo, area_per, personal },
        });
    } catch (error) {
        console.error('Error en la operación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor al registrar la visita.',
        });
    }
};

const darAccesoVisitante = async (req, res) => { 
    console.log('Endpoint alcanzado');
    console.log('q', req.body);

    try {
        const { id_visit } = req.params; 
        console.log('id_visit:', id_visit);

        const { entrada_r, est, id_usu } = req.body;
        console.log('entrada_r:', entrada_r, 'est:', est, 'id_usu:', id_usu);

        const result = await pool.query(
            'UPDATE visitas SET ? WHERE id_visit = ?',
            [{ entrada_h: entrada_r, est, id_usu }, id_visit]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: `No se pudo actualizar, id_visit: ${id_visit} no encontrado` 
            });
        }

        res.status(200).json({ 
            message: 'Datos de visita actualizados correctamente' 
        });
    } catch (error) {
        console.error('Error al actualizar la visita:', error);
        res.status(500).json({ 
            message: 'Error al actualizar la visita', 
            error: error.message 
        });
    }
};




const getVisitasAct = async (req, res) => {
    // Consulta para visitantes
    const SQL_QUERY_VISITANTES = `
        SELECT 
            visitantes.id_vit,
            visitantes.id_catv,
            visitantes.nombre,  
            visitantes.empresa, 
            visitantes.foto,
            visitantes.clave,
            visitas.reg_entrada, 
            visitas.reg_salida,
            visitas.hora_entrada,
            visitas.area_per,
            visitas.id_visit,
            visitas.id_vit,
            visitas.est,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nom_com,
            categorias_visitas.id_catv,
            categorias_visitas.tipo
        FROM visitas
        JOIN visitantes ON visitas.id_vit = visitantes.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_duenio
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
        WHERE visitas.est = 'A'
    `;

    // Consulta para transportistas
    const SQL_QUERY_TRANSPORTISTA = `
        SELECT 
            transportista.id_transp,
            transportista.id_catv,
            transportista.nombre,  
            transportista.empresa, 
            transportista.foto,
            transportista.clave,
            visitas.reg_entrada, 
            visitas.reg_salida,
            visitas.hora_entrada,
            visitas.area_per,
            visitas.id_visit,
            visitas.id_vit,
            visitas.est,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nom_com,
            categorias_visitas.id_catv,
            categorias_visitas.tipo
        FROM visitas
        JOIN transportista ON visitas.id_vit = transportista.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_duenio
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
        WHERE visitas.est = 'A'
    `;

    try {
        // Ejecutar ambas consultas
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);

        // Combinar resultados
        const visitasActivas = [...resultVisitantes, ...resultTransportistas];

        res.status(200).json({
            success: true,
            visitas: visitasActivas,
        });
    } catch (error) {
        console.error('Error al obtener las visitas activas:', error);
        res.status(500).json({
            success: false,
            message: 'Ocurrió un error al obtener las visitas activas.',
        });
    }
};



module.exports = { createVisita, darAccesoVisitante, getVisitas, getVisitasAct}