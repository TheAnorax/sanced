
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse, format, isValid } = require('date-fns');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join( 'C:/acc-ced'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const vehiculos = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join( 'C:/vehiculos'));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const pagos = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join( 'C:/pagos'));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

const upload = multer({ storage });
const uploadImgVehiculo = multer({ storage: vehiculos });
const uploadImgPagos = multer({ storage: pagos });

//en visitas arreglar que no las muestre si aun no se ha dado el si o no de acceso al vehiculo 
//#region visitas
const getVisitas = async (req, res) => {
    const SQL_QUERY_VISITANTES = `
        SELECT 
            visitantes.id_catv,
            visitantes.nombre,  
            visitantes.apellidos,  
            visitantes.empresa, 
            visitantes.foto,
            visitantes.clave,
            visitas.reg_entrada, 
            visitas.reg_salida,
            visitas.hora_entrada,
            visitas.entrada_h,
            visitas.id_visit,
            visitas.est,
            visitas.personal,
            visitas.clave_visit,
            visitas.acc_veh,
            visitas.rango_horas,
            visitas.llegada, 
            vehiculos.id_veh,
            vehiculos.placa,
            vehiculos.acc_dir,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            vehiculo_per.id_vehpr,
            vehiculo_per.id_vit,
            vehiculo_per.acc,
            contenedores.id_cont,
            contenedores.id_prov,
            contenedores.no_contenedor,
            areas.id_area,
            areas.area,
            CONCAT(visitantes.nombre, ' ', visitantes.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp
        FROM visitas
        JOIN visitantes ON visitas.id_vit = visitantes.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.clave_visit = acomp.clave_visit
        LEFT JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
        LEFT JOIN vehiculo_per ON visitas.id_vit = vehiculo_per.id_vit
        LEFT JOIN contenedores ON visitas.id_vit = contenedores.id_prov
        LEFT JOIN areas ON visitas.area_per = areas.id_area
        WHERE DATE(visitas.reg_entrada) = CURRENT_DATE
            AND visitas.reg_salida IS NULL
            AND visitas.est IS NULL

            GROUP BY visitas.id_visit

    `;

    const SQL_QUERY_TRANSPORTISTA = `
        SELECT 
            transportista.id_catv,
            transportista.nombre, 
            transportista.apellidos, 
            transportista.empresa, 
            transportista.foto,
            transportista.clave,
            visitas.reg_entrada, 
            visitas.reg_salida,
            visitas.hora_entrada,
            visitas.entrada_h,
            visitas.id_visit,
            visitas.est,
            visitas.clave_visit,
            visitas.acc_veh,
            visitas.llegada,
            vehiculos.id_veh,
            vehiculos.placa,
            vehiculos.acc_dir,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            areas.id_area,
            areas.area,
            CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp
        FROM visitas
        JOIN transportista ON visitas.id_vit = transportista.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
        LEFT JOIN areas ON visitas.area_per = areas.id_area
        WHERE DATE(visitas.reg_entrada) = CURRENT_DATE
            AND visitas.reg_salida IS NULL
            GROUP BY visitas.id_visit
    `;

    try {

        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);

        //const visitasActivas = [...resultVisitantes, ...resultTransportistas];
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
    const { reg_entrada, hora_entrada, id_vit, motivo, area_per, personal, acompanantes, access, id_veh, motivo_acc } = req.body;

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
        INSERT INTO acomp (nombre_acomp, apellidos_acomp, no_ine_acomp, id_vit, id_visit, clave_visit ) 
        VALUES ?
    `;

    const SQL_INSERT_ACCESO_VEHICULO =` INSERT INTO vehiculo_per (id_visit, id_vit, id_veh, motivo_acc) 
        VALUES (?,?,?,?) `

    const SQL_UPDATE_CLAVE_VISITA = `UPDATE visitas SET clave_visit = ? WHERE id_vit = ?`;

    const SQL_UPDATE_CLAVE_ACCESO = `UPDATE visitas SET acc_veh = ? WHERE id_vit = ?`;

    try {
        const [checkResult] = await pool.query(SQL_CHECK_VISIT, [id_vit, reg_entrada]);
        if (checkResult.length > 0) {
            return res.status(404).json({
                success: false,
                error: 'Este invitado ya tiene una visita registrada para la fecha indicada.',
            });
        }

        const [insertResult] = await pool.query(SQL_INSERT_VISIT, [
            id_vit, reg_entrada, hora_entrada, motivo, area_per, personal,
        ]);
        const visitaId = insertResult.insertId;

        const prefix = id_vit.startsWith('TR') ? 'TR' : id_vit.startsWith('VT') ? 'VT' : 'GEN';
        const random = Math.floor(1000 + Math.random() * 900).toString();
        
        const claveVisita = `${prefix}${random}${visitaId}`;

        const prefixAc = id_vit.startsWith('TR') ? 'TR' : id_vit.startsWith('PR') ? 'PR' : 'GEN';
        const acceso = 'S'

        await pool.query(SQL_UPDATE_CLAVE_VISITA, [claveVisita, id_vit]);

        if(access === 1){
            await pool.query(SQL_INSERT_ACCESO_VEHICULO, [visitaId, id_vit, id_veh, motivo_acc]);
        }

        if (acompanantes && acompanantes.length > 0) {
            const values = acompanantes.map((acomp) => [acomp.nombre_acomp, acomp.apellidos_acomp, acomp.no_ine_acomp, id_vit, visitaId, claveVisita]);
            await pool.query(SQL_INSERT_ACOMPANANTES, [values]);

            return res.json({
                success: true,
                message: 'Visita y acompañantes registrados correctamente.',
                data: { id_vit, reg_entrada, hora_entrada, motivo, area_per, personal, acompanantes, claveVisita },
            });
        }

        

        if(prefixAc === 'TR' || prefixAc === 'PR'){
            await pool.query(SQL_UPDATE_CLAVE_ACCESO, [acceso, id_vit]);
        }

        return res.json({
            message: 'Visita registrada correctamente sin acompañantes.'});
    } catch (error) {
        console.error('Error en la operación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor al registrar la visita.',
        });
    }
};

const createVisitaProveedor = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { reg_entrada, hora_entrada, id_vit, motivo, area_per, personal, contenedor, naviera } = req.body;

    // SQL Queries
    const SQL_CHECK_VISIT = `
        SELECT 1 
        FROM visitas 
        WHERE id_vit = ? 
        AND DATE(reg_entrada) = DATE(?)
    `;

    const SQL_INSERT_VISIT = `
        INSERT INTO visitas (id_vit, reg_entrada, hora_entrada, motivo, area_per, personal, rango_horas)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const SQL_INSERT_CONTENEDOR = `
        INSERT INTO contenedores (id_prov, no_contenedor, naviera) 
        VALUES (?, ?, ?)
    `;

    const SQL_UPDATE_CLAVE_VISITA = `UPDATE visitas SET clave_visit = ? WHERE id_vit = ?`;

    const SQL_UPDATE_CLAVE_ACCESO = `UPDATE visitas SET acc_veh = ? WHERE id_vit = ?`;

    try {
        // Validar el formato de fecha y hora
        const entradaCompleta = `${reg_entrada} ${hora_entrada}`;
        console.log('Fecha y hora combinadas:', entradaCompleta); // Verifica que la combinación de fecha y hora sea correcta
    
        const horaEntrada = parse(entradaCompleta, 'yyyy-MM-dd hh:mm a', new Date());
        if (!isValid(horaEntrada)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de fecha u hora inválido. Verifique reg_entrada y hora_entrada.',
            });
        }

        // Verificar si ya existe una visita para el día
        const [checkResult] = await pool.query(SQL_CHECK_VISIT, [id_vit, reg_entrada]);
        if (checkResult.length > 0) {
            return res.status(404).json({
                success: false,
                error: 'Este invitado ya tiene una visita registrada para la fecha indicada.',
            });
        }

        // Calcular el rango de horas
        const horaSalida = new Date(horaEntrada);
        horaSalida.setHours(horaSalida.getHours() + 24);
        const rangoHoras = `${horaEntrada.toISOString()} a ${horaSalida.toISOString()}`;
        const rangoHorasFormateado = `${format(horaEntrada, 'hh:mm a')} a ${format(horaSalida, 'hh:mm a')}`;

        // Insertar la visita
        const [insertResult] = await pool.query(SQL_INSERT_VISIT, [
            id_vit,
            reg_entrada,
            hora_entrada,
            motivo,
            area_per,
            personal,
            rangoHorasFormateado,
        ]);
        const visitaId = insertResult.insertId;

        // Generar clave de visita
        const random = Math.floor(1000 + Math.random() * 900).toString();
        const claveVisita = `VST${random}${visitaId}`;

        // Actualizar clave de visita
        await pool.query(SQL_UPDATE_CLAVE_VISITA, [claveVisita, id_vit]);

        // Actualizar acceso si aplica
        const prefixAc = id_vit.startsWith('PR') && 'PR' ;
        if (prefixAc === 'TR' || prefixAc === 'PR') {
            await pool.query(SQL_UPDATE_CLAVE_ACCESO, ['S', id_vit]);
        }

        // Insertar contenedor si es un proveedor
        if (contenedor) {
            await pool.query(SQL_INSERT_CONTENEDOR, [id_vit, contenedor, naviera]);
        }

        return res.json({
            success: true,
            message: 'Visita registrada correctamente.',
        });
    } catch (error) {
        console.error('Error en la operación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor al registrar la visita.',
        });
    }
};

const cancelarVisita = async (req, res) => {
    const SQL_CANCELAR_VISITAS = `
    UPDATE visitas
    SET est = 'CANCELADA'
    WHERE reg_salida IS NULL
    AND est IS NULL
    AND TIMESTAMPDIFF(MINUTE, CONCAT(reg_entrada, ' ', hora_entrada), NOW()) > 120;
`;

    try {
        // Cancelar visitas no presentadas después de 2hrs minutos
        await pool.query(SQL_CANCELAR_VISITAS);
        console.log('Visitas canceladas exitosamente.');
    } catch (error) {
        console.error('Error en las consultas:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
};
 cancelarVisita();

// Programar la función para que se ejecute cada hora (3600000 ms)
 setInterval(async () => {
     console.log('Ejecutando la cancelación de visitas cada hora');
     await cancelarVisita();
 }, 3600000);

const validacionVehiculo = async (req, res) => {
    console.log('Request body:', req.body);
    const { id_veh, id_visit, comentario, id_usu } = req.body;

    const img1 = req.files?.img1?.[0]?.filename || null;
    const img2 = req.files?.img2?.[0]?.filename || null;
    const img3 = req.files?.img3?.[0]?.filename || null;
    const img4 = req.files?.img4?.[0]?.filename || null;

    const SQL_INSERT_IMG_VEHICULO = `
      INSERT INTO vehiculos_fotos 
      (id_veh, id_visit, img1, img2, img3, img4, comentario, id_usu)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [resultImgVehiculo] = await pool.query(SQL_INSERT_IMG_VEHICULO, [
        id_veh,
        id_visit,
        img1,
        img2,
        img3,
        img4,
        comentario,
        id_usu,
      ]);

       res.status(201).json({
        message: 'Imágenes y conductor guardados correctamente.',
        data: {
          imgVehiculoId: resultImgVehiculo.insertId,
          id_veh,
          id_visit,
          comentario,
        }
      });
    } catch (error) {
      console.error('Error al guardar las imágenes o conductor:', error);

      res.status(500).json({
        error: 'Hubo un error al guardar los datos. Por favor, intenta nuevamente.',
        details: error.message
      });
    }
};

const validacionProveedor = async (req, res) => {
    console.log('Request body:', req.body);
    const { clave, id_veh, id_visit, nombre_acomp, apellidos_acomp, no_ine_acomp, id_vit, clave_visit, proveedor } = req.body;

    const foto = req.file ? req.file.filename : null;

    const SQL_UPDATE_FOTO = `UPDATE visitantes SET foto = ? WHERE clave = ?`;

    const SQL_INSERT_CONDUCTOR = `
      INSERT INTO acomp 
      (nombre_acomp, apellidos_acomp, no_ine_acomp, id_vit, id_visit, clave_visit, proveedor)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [updateFoto] = await pool.query(SQL_UPDATE_FOTO, [
        foto, clave
      ]);

      const [resultConductor] = await pool.query(SQL_INSERT_CONDUCTOR, [
        nombre_acomp, 
        apellidos_acomp, 
        no_ine_acomp, 
        id_vit, 
        id_visit, 
        clave_visit,
        proveedor
      ]);

      res.status(201).json({
        message: 'Imágenes y conductor guardados correctamente.',
        data: {
          imgVehiculoId: updateFoto.insertId,
          conductorId: resultConductor.insertId,
          id_veh,
          id_visit,
        }
      });
    } catch (error) {
      console.error('Error al guardar las imágenes o conductor:', error);

      res.status(500).json({
        error: 'Hubo un error al guardar los datos. Por favor, intenta nuevamente.',
        details: error.message
      });
    }
};

const pasarValidar = async (req, res) => { 
    console.log('Body', req.body);

    const hora_llegada = new Date(); 

    const SQL_PASAR_A_VALIDAR = `UPDATE visitas SET llegada = ?, hora_llegada = ? WHERE id_visit = ?`;

    try {
        const { id_visit } = req.params; 
        const { llegada } = req.body; 
        const [result] = await pool.query(SQL_PASAR_A_VALIDAR, [llegada, hora_llegada, id_visit]);

        if (result.affectedRows > 0) {
            res.status(200).json({ 
                message: 'Datos de visita actualizados correctamente' 
            });
        } else {
            res.status(404).json({
                message: 'Visita no encontrada o no se realizaron cambios'
            });
        }
    } catch (error) {
        console.error('Error al actualizar la visita:', error);
        res.status(500).json({ 
            message: 'Error al actualizar la visita', 
            error: error.message 
        });
    }
};


  const darAccesoVisitante = async (req, res) => { 
    console.log('Endpoint alcanzado');
    console.log('q', req.body);

    try {
        const { id_visit } = req.params; 
        console.log('id_visit:', id_visit);

        const { est, id_usu_ac } = req.body;
        const entrada_h = new Date();
        console.log('entrada_h:', entrada_h, 'est:', est, 'id_usu_ac:', id_usu_ac);

        const [visitData] = await pool.query('SELECT id_vit FROM visitas WHERE id_visit = ?', [id_visit]);

        if (visitData.length === 0) {
            return res.status(404).json({ 
                message: `No se encontró el visitante con id_visit: ${id_visit}` 
            });
        }

        const id_vit = visitData[0].id_vit.trim(); 

        if (id_vit.startsWith('PR') || id_vit.startsWith('TR')) {
            const result = await pool.query(
                'UPDATE visitas SET ? WHERE id_visit = ?',
                [{ entrada_h, est, id_usu_ac, acc_veh: 'S' }, id_visit]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: `No se pudo actualizar, id_visit: ${id_visit} no encontrado` 
                });
            }
        } else {
            const result = await pool.query(
                'UPDATE visitas SET ? WHERE id_visit = ?',
                [{ entrada_h, est, id_usu_ac }, id_visit]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: `No se pudo actualizar, id_visit: ${id_visit} no encontrado` 
                });
            }
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
            visitantes.apellidos ,
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
            visitas.personal,
            visitas.motivo,
            visitas.clave_visit,
            visitas.entrada_h,
            visitas.acc_veh,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            vehiculo_per.id_vehpr,
            vehiculo_per.acc,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            contenedores.id_cont,
            contenedores.no_contenedor,
            areas.id_area,
            areas.area,
            CONCAT(visitantes.nombre, ' ', visitantes.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp
        FROM visitas
        JOIN visitantes ON visitas.id_vit = visitantes.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
        LEFT JOIN contenedores ON visitantes.clave = contenedores.id_prov
        LEFT JOIN vehiculo_per ON visitantes.clave = vehiculo_per.id_vit
        LEFT JOIN areas ON visitas.area_per = areas.id_area
        WHERE visitas.est = 'A'
        GROUP BY visitas.id_visit
    `;

    // Consulta para transportistas
    const SQL_QUERY_TRANSPORTISTA = `
        SELECT 
            transportista.id_transp,
            transportista.id_catv,
            transportista.nombre, 
            transportista.apellidos,
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
            visitas.personal,
            visitas.motivo,
            visitas.clave_visit,
            visitas.entrada_h,
            visitas.acc_veh,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            areas.id_area,
            areas.area,
            CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp
        FROM visitas
        JOIN transportista ON visitas.id_vit = transportista.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
        LEFT JOIN areas ON visitas.area_per = areas.id_area
        WHERE visitas.est = 'A'
        GROUP BY visitas.id_visit
    `;

    try {
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);

        // Combinar resultados
        //const visitasActivas = [...resultVisitantes, ...resultTransportistas];

        res.json({
            visitantes: resultVisitantes,
            transportistas: resultTransportistas,
        });
    } catch (error) {
        console.error('Error al obtener las visitas activas:', error);
        res.status(500).json({
            success: false,
            message: 'Ocurrió un error al obtener las visitas activas.',
        });
    }
};

const darSalidaVisitante = async (req, res) => {
    //console.log('Endpoint alcanzado');
    console.log('q', req.body);

    try {
        const { id_visit } = req.params; 
        console.log('id_visit:', id_visit);

        const {  est, id_usu_out, tiempo_visita } = req.body;
        const reg_salida = new Date();
        console.log('salid:', reg_salida,'est:', est, 'id_usu_out:', id_usu_out, 'tiempo_visita:', tiempo_visita);

        const result = await pool.query(
            'UPDATE visitas SET ? WHERE id_visit = ?',
            [{ reg_salida, est, id_usu_out, tiempo_visita }, id_visit]
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

const getVisitasReporte = async (req, res) => {
    // Consulta para visitantes
    const SQL_QUERY_VISITANTES = `
        SELECT 
            visitantes.id_vit,
            visitantes.id_catv,
            visitantes.nombre, 
            visitantes.apellidos,
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
            visitas.clave_visit,
            visitas.entrada_h,
            visitas.id_usu_ac,
            visitas.id_usu_out, 
            visitas.tiempo_visita,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            CONCAT(visitantes.nombre, ' ', visitantes.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp,
            COUNT(multas_visitas.id_mul) AS total_multas,
            COUNT(visitas.id_visit) AS total_visitas
        FROM visitas
        JOIN visitantes ON visitas.id_vit = visitantes.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
        LEFT JOIN multas_visitas ON visitantes.clave = multas_visitas.id_vit
        WHERE DATE(visitas.reg_salida) = CURRENT_DATE
            AND visitas.reg_salida IS NOT NULL
        GROUP BY 
            visitantes.id_vit,
            visitantes.id_catv,
            visitantes.nombre, 
            visitantes.apellidos ,
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
            visitas.clave_visit,
            visitas.entrada_h,
            visitas.id_usu_ac,
            visitas.id_usu_out, 
            visitas.tiempo_visita,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo
        HAVING COUNT(visitas.id_visit) > 0;
    `;

    // Consulta para transportistas
    const SQL_QUERY_TRANSPORTISTA = `
        SELECT 
            transportista.id_transp,
            transportista.id_catv,
            transportista.nombre, 
            transportista.apellidos,  
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
            visitas.clave_visit,
            visitas.entrada_h,
            visitas.id_usu_ac,
            visitas.id_usu_out, 
            visitas.tiempo_visita,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp,
            COUNT(multas_visitas.id_mul) AS total_multas,
            COUNT(visitas.id_visit) AS total_visitas
        FROM visitas
        JOIN transportista ON visitas.id_vit = transportista.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
        LEFT JOIN multas_visitas ON transportista.clave = multas_visitas.id_vit
        WHERE DATE(visitas.reg_salida) = CURRENT_DATE
            AND visitas.reg_salida IS NOT NULL
        GROUP BY 
            transportista.id_transp,
            transportista.id_catv,
            transportista.nombre, 
            transportista.apellidos,
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
            visitas.clave_visit,
            visitas.entrada_h,
            visitas.id_usu_ac,
            visitas.id_usu_out, 
            visitas.tiempo_visita,
            vehiculos.id_veh,
            vehiculos.placa,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo
        HAVING COUNT(visitas.id_visit) > 0;
    `;

    try {
        // Ejecutar ambas consultas
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);

        // Combinar resultados
        const visitasReporte = [...resultVisitantes, ...resultTransportistas];

        res.json({reporte: visitasReporte
        });
    } catch (error) {
        console.error('Error al obtener las visitas activas:', error);
        res.status(500).json({
            success: false,
            message: 'Ocurrió un error al obtener las visitas activas.',
        });
    }
};

const visitantesAll = async (req, res) => {
    // Consulta para visitantes
    const SQL_QUERY_VISITANTES = `
        SELECT 
    visitantes.id_vit,
    visitantes.id_catv,
    visitantes.nombre, 
    visitantes.apellidos ,
    visitantes.empresa,
    visitantes.telefono, 
    visitantes.no_ine,
    visitantes.no_licencia,  
    visitantes.foto,
    visitantes.puesto,
    visitantes.clave,
    vehiculos.id_veh,
    vehiculos.marca,
    vehiculos.modelo,
    vehiculos.placa,
    vehiculos.anio,
    vehiculos.seguro,
    vehiculos.acc_dir,
    categorias_visitas.id_catv,
    categorias_visitas.tipo,
    CONCAT(visitantes.nombre, ' ', visitantes.apellidos ) AS nombre_completo,
    COUNT(multas_visitas.id_mul) AS total_multas,
    COUNT(visitas.id_visit) AS total_visitas,
    -- Verificar si el visitante tiene acceso
    CASE 
        WHEN multas_visitas.fecha_acceso > CURDATE() THEN 'SIN ACCESO'
        ELSE 'CON ACCESO'
    END AS estado_acceso
FROM visitantes
LEFT JOIN vehiculos ON visitantes.clave = vehiculos.clave_con
LEFT JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
LEFT JOIN multas_visitas ON visitantes.clave = multas_visitas.id_vit
LEFT JOIN visitas ON visitantes.clave = visitas.id_vit
WHERE visitantes.est = 'A'
GROUP BY 
    visitantes.id_vit

            
    `;

    // Consulta para transportistas
    const SQL_QUERY_TRANSPORTISTA = `
        SELECT 
    transportista.id_transp,
    transportista.id_catv,
    transportista.nombre, 
    transportista.apellidos, 
    transportista.empresa, 
    transportista.telefono,
    transportista.foto,
    transportista.no_licencia,
    transportista.no_ine,
    transportista.clave,
    vehiculos.id_veh,
    vehiculos.marca,
    vehiculos.modelo,
    vehiculos.placa,
    vehiculos.anio,
    vehiculos.seguro,
    categorias_visitas.id_catv,
    categorias_visitas.tipo,
    vehiculos.acc_dir,
    CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
    COUNT(multas_visitas.id_mul) AS total_multas,
    COUNT(visitas.id_visit) AS total_visitas,
    -- Verificar si el transportista tiene acceso
    CASE 
        WHEN multas_visitas.fecha_acceso > CURDATE() THEN 'SIN ACCESO'
        ELSE 'CON ACCESO'
    END AS estado_acceso
FROM transportista
LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
LEFT JOIN vehiculos ON transportista.clave = vehiculos.clave_con
LEFT JOIN multas_visitas ON transportista.clave = multas_visitas.id_vit
LEFT JOIN visitas ON transportista.clave = visitas.id_vit
WHERE transportista.est = 'A'
GROUP BY 
    transportista.id_transp

            
        `;

    try {
        // Ejecutar ambas consultas
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);

        // Combinar resultados
        const visitantesAll = [...resultVisitantes, ...resultTransportistas];

        res.json({visitantesAll });
    } catch (error) {
        console.error('Error al obtener las visitas activas:', error);
        res.status(500).json({
            success: false,
            message: 'Ocurrió un error al obtener las visitas activas.',
        });
    }
}
//#endregion

//#region visitantes
//vehiculo_per.acc-> de la tabla de permiso de vehiculos aplica solo para visitantes que no son PROVEEDORES Y TRANSPORTISTAS
const getVisitantes = async (req, res) => {
    const SQL_QUERY_VISITANTES = `
    SELECT 
        visitantes.id_vit, 
        visitantes.nombre,
        visitantes.clave, 
        vehiculos.id_veh,
        vehiculos.placa,
        visitantes.id_catv, 
        multas_visitas.fecha_acceso,
        CONCAT(visitantes.nombre, ' ', visitantes.apellidos) AS nombre_completo,
        categorias_visitas.tipo AS categoria
    FROM visitantes
    JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
    LEFT JOIN vehiculos ON visitantes.clave = vehiculos.clave_con
    LEFT JOIN multas_visitas ON visitantes.clave = multas_visitas.id_vit
    WHERE visitantes.id_catv != 4 AND visitantes.id_catv != 8
    AND (
        multas_visitas.fecha_acceso IS NULL 
        OR multas_visitas.fecha_acceso <= NOW()
    )
    GROUP BY visitantes.id_vit
`;

const SQL_QUERY_TRANSPORTISTA = `
    SELECT 
        transportista.id_transp, 
        transportista.nombre,
        transportista.clave, 
        transportista.id_catv, 
        vehiculos.id_veh,
        vehiculos.placa,
        vehiculos.acc_dir,
        multas_visitas.fecha_acceso,
        CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
        categorias_visitas.tipo AS categoria
    FROM transportista
    JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
    JOIN vehiculos ON transportista.clave = vehiculos.clave_con
    LEFT JOIN multas_visitas ON transportista.clave = multas_visitas.id_vit
    WHERE transportista.id_catv != 4 AND transportista.id_catv != 8
    AND (
        multas_visitas.fecha_acceso IS NULL 
        OR multas_visitas.fecha_acceso <= NOW()
    )
    GROUP BY transportista.id_transp
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


const getProveedores = async (req, res) => {
    const SQL_QUERY_VISITANTES = `
        SELECT 
            visitantes.id_vit, 
            visitantes.nombre,
            visitantes.clave, 
            vehiculos.id_veh,
            vehiculos.placa,
            visitantes.id_catv, 
            multas_visitas.fecha_acceso,
            CONCAT(visitantes.nombre, ' ', visitantes.apellidos) AS nombre_completo,
            
            categorias_visitas.tipo AS categoria
        FROM visitantes
        JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
        LEFT JOIN vehiculos ON visitantes.clave = vehiculos.clave_con
        LEFT JOIN multas_visitas ON visitantes.clave = multas_visitas.id_vit
        WHERE visitantes.id_catv = 4
        AND (
            multas_visitas.fecha_acceso IS NULL 
            OR multas_visitas.fecha_acceso <= NOW()
        )
        GROUP BY visitantes.id_vit
    `;

    try {
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);

        res.json({
            visitantes: resultVisitantes,
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
    console.log('Cuerpo de la solicitud:', req.body);
    const { id_catv, nombre, apellidos, empresa, telefono, no_licencia, no_ine, marca, modelo, placa, anio, seguro, puesto, no_empleado } = req.body;
    const foto = req.file ? req.file.filename : null;
    const registro = new Date();
    const est = 'A';
    const fechaRegistro = new Date(registro);
    const dia = fechaRegistro.getDate().toString().padStart(2, '0');
    const acc_dir = 'S';

    const SQL_INSERT_VISITA = `
        INSERT INTO visitantes (id_catv, nombre, apellidos, empresa, telefono, foto, no_licencia, no_ine,puesto, no_empleado, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE = `UPDATE visitantes SET clave = ? WHERE id_vit = ?`;
    const SQL_INSERT_VEHICULO = `
        INSERT INTO vehiculos (clave_con, empresa,marca, modelo, placa, anio, seguro, registro,est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_INSERT_VEHICULO_PAQUETERIA = `
        INSERT INTO vehiculos (clave_con, empresa,marca, modelo, placa, anio, seguro, acc_dir, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        let clavePersonalizada;
        let id_persona;

        const [insertResult] = await pool.query(SQL_INSERT_VISITA, [
            id_catv, nombre, apellidos, empresa, telefono, foto, no_licencia, no_ine, puesto, no_empleado, registro, est,
        ]);

        id_persona = insertResult.insertId;
        //clavePersonalizada = `VT${id_catv}${dia}${id_persona}`;
        clavePersonalizada = `${id_catv === '4' ? 'PR' : 'VT'}${dia}${id_persona}`;

        await pool.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);
        

        if (no_licencia) {
            if (id_catv === '7') {
                await pool.query(SQL_INSERT_VEHICULO_PAQUETERIA, [
                    clavePersonalizada, empresa, marca, modelo, placa, anio, seguro, acc_dir,registro, est,
                ]);
            } else {
                await pool.query(SQL_INSERT_VEHICULO, [
                    clavePersonalizada, empresa, marca, modelo, placa, anio, seguro, registro, est,
                ]);
            }
        }

        res.json({ 
            tipo: id_catv === '4' ? 'PR' : id_catv === '6' ? 'MN' : 'VT', 
            message: `${clavePersonalizada}` 
        });
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


const updateVisitante = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { clave } = req.body;
    const foto = req.file ? req.file.filename : null;

    let tabla = null;
    if (clave.startsWith('VT') || clave.startsWith('PR')) {
        tabla = 'visitantes';
    } else if (clave.startsWith('TR')) {
        tabla = 'transportista';
    }

    if (!tabla) {
        return res.status(400).json({ error: 'Prefijo de clave no válido' });
    }

    const SQL_UPDATE_FOTO = `UPDATE ${tabla} SET foto = ? WHERE clave = ?`;

    try {
        if (!foto) {
            return res.status(400).json({ error: 'No se proporcionó una foto' });
        }

        await pool.query(SQL_UPDATE_FOTO, [foto, clave]);
        res.json({ message: `Foto actualizada en ${tabla} con clave: ${clave}` });
    } catch (error) {
        console.error('Error al actualizar la foto:', error);
        res.status(500).json({ error: 'Error al actualizar la foto' });
    }
};

const updateInfoVisitantes = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { clave, placa, nombre, apellidos, empresa, telefono, no_licencia, no_ine } = req.body;
    const foto = req.file ? req.file.filename : null;
    const acc_dir = 'S';

    let tabla = null;
    if (clave.startsWith('VT') || clave.startsWith('PR')) {
        tabla = 'visitantes';
    } else if (clave.startsWith('TR') || clave.startsWith('MN')) {
        tabla = 'transportista';
    }

    if (!tabla) {
        return res.status(400).json({ error: 'Prefijo de clave no válido. Debe comenzar con VT, PR, TR o MN.' });
    }

    // Consultas SQL dinámicas
    const SQL_UPDATE_INFORMACION = `
        UPDATE ${tabla}
        SET nombre = ?, apellidos = ?, empresa = ?, telefono = ?, foto = ?, no_licencia = ?, no_ine = ?
        WHERE clave = ?
    `;
    const SQL_UPDATE_VEHICULO = `
        UPDATE vehiculos
        SET clave_con = ?, acc_dir = ?
        WHERE placa = ?
    `;
    const SQL_GET_CLAVE_CON = `
        SELECT clave_con 
        FROM vehiculos 
        WHERE placa = ?
    `;
    const SQL_GET_PLACA_BY_CLAVE = `
        SELECT placa 
        FROM vehiculos 
        WHERE clave_con = ?
    `;

    const conexion = pool;

    try {
        const [existingClaveCon] = await conexion.query(SQL_GET_CLAVE_CON, [placa]);
        if (
            existingClaveCon.length > 0 &&
            existingClaveCon[0].clave_con &&
            existingClaveCon[0].clave_con !== clave
        ) {
            return res.status(400).json({
                error: `El vehículo con la placa "${placa}" está asociado a otro visitante.`,
                type: 'placaOtroVisitante'
            });
        }

        const [existingPlaca] = await conexion.query(SQL_GET_PLACA_BY_CLAVE, [clave]);
        if (
            existingPlaca.length > 0 && 
            existingPlaca[0].placa !== placa 
        ) {
            return res.status(400).json({
                error: `El visitante con la clave "${clave}" ya tiene una placa registrada.`,
                type:'placaAsignada'
            });
        }

        await conexion.query(SQL_UPDATE_INFORMACION, [
            nombre, apellidos, empresa, telefono, foto, no_licencia, no_ine, clave,
        ]);

        await conexion.query(SQL_UPDATE_VEHICULO, [clave, acc_dir, placa]);

        res.json({
            message: `Información actualizada correctamente en la tabla ${tabla} y en la tabla de vehículos.`,
        });
    } catch (error) {
       

        console.error('Error al actualizar la información:', error);
        res.status(500).json({
            error: 'Error al actualizar la información',
            details: error.message,
        });
    }
};

const updateInfoVisitantesVehiculo = async (req, res) => {
    console.log("Cuerpo de la solicitud:", req.body);
    const { clave, placa, nombre, apellidos, empresa, telefono, no_licencia, no_ine, marca, modelo, anio, seguro } = req.body;
    const nuevaFoto = req.file ? req.file.filename : null; 
    const registro = new Date();
    const est = 'A';

    const SQL_UPDATE_INFORMACION = `
        UPDATE visitantes
        SET nombre = ?, apellidos = ?, empresa = ?, telefono = ?, no_licencia = ?, no_ine = ?
        WHERE clave = ?;
    `;

    const SQL_UPDATE_INFORMACION_FOTO = `
        UPDATE visitantes
        SET foto = ?
        WHERE clave = ?;
    `;

    const SQL_UPDATE_VEHICULO = `
        UPDATE vehiculos
        SET empresa = ?, marca = ?, modelo = ?, placa = ?, anio = ?, seguro = ?
        WHERE clave_con = ?;
    `;

    const SQL_INSERT_VEHICULO = `
        INSERT INTO vehiculos (empresa, marca, modelo, placa, anio, seguro, registro, est, clave_con)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const SQL_GET_CLAVE_CON = `
        SELECT clave_con 
        FROM vehiculos 
        WHERE clave_con = ?;
    `;

    const SQL_GET_FOTO_ACTUAL = `
        SELECT foto 
        FROM visitantes 
        WHERE clave = ?;
    `;

    const conexion = pool;

    try {
        const updateParams = [nombre, apellidos, empresa, telefono, no_licencia, no_ine, clave];
        await conexion.query(SQL_UPDATE_INFORMACION, updateParams);

        if (nuevaFoto) {
            const [rows] = await conexion.query(SQL_GET_FOTO_ACTUAL, [clave]);
            if (rows.length > 0 && rows[0].foto) {
                const fotoActual = rows[0].foto;
                fs.unlink(path.join('C:/acc-ced', fotoActual), (err) => {
                    if (err) console.error("Error al eliminar el archivo:", err);
                });
            }

            await conexion.query(SQL_UPDATE_INFORMACION_FOTO, [nuevaFoto, clave]);
        }

        const [existingVehicle] = await conexion.query(SQL_GET_CLAVE_CON, [clave]);
        if(no_licencia){

            
            if (existingVehicle.length > 0) {
                await conexion.query(SQL_UPDATE_VEHICULO, [empresa, marca, modelo, placa, anio, seguro, clave]);
            } else {
                await conexion.query(SQL_INSERT_VEHICULO, [empresa, marca, modelo, placa, anio, seguro, registro, est, clave]);
            }
        }
        res.json({
            message: `Información del visitante con clave "${clave}" actualizada correctamente.`,
        });
    } catch (error) {
        console.error("Error al actualizar la información:", error);
        res.status(500).json({
            error: "Error al actualizar la información",
            details: error.message,
        });
    }
};


const updateClave = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const nuevaFoto = req.file ? req.file.filename : null; 
    const { clave, placa } = req.body;
    const acc_dir = 'S'; 

    // Consultas SQL dinámicas
    const SQL_CHECK_CLAVE_CON = `
        SELECT clave_con, placa 
        FROM vehiculos 
        WHERE clave_con = ?
    `;
    const SQL_UPDATE_VEHICULO = `
        UPDATE vehiculos
        SET clave_con = ?, acc_dir = ?
        WHERE placa = ?
    `;
    const SQL_REMOVE_CLAVE_CON = `
        UPDATE vehiculos
        SET clave_con = NULL
        WHERE clave_con = ?
    `;
    const SQL_UPDATE_INFORMACION_FOTO = `
        UPDATE transportista
        SET foto = ?
        WHERE clave = ?
    `;

    const conexion = pool;

    try {
        const [existingClave] = await conexion.query(SQL_CHECK_CLAVE_CON, [clave]);

        if (existingClave.length > 0 && existingClave[0].placa !== placa) {
            console.log('Eliminando clave de otro vehículo');
            await conexion.query(SQL_REMOVE_CLAVE_CON, [clave]);
        }

        await conexion.query(SQL_UPDATE_VEHICULO, [clave, acc_dir, placa]);

        if (nuevaFoto) {
            console.log('Actualizando foto del visitante');
            await conexion.query(SQL_UPDATE_INFORMACION_FOTO, [nuevaFoto, clave]);
        }

        res.json({
            message: `Información actualizada correctamente.`,
        });
    } catch (error) {
        console.error('Error al actualizar la información:', error);
        res.status(500).json({
            error: 'Error al actualizar la información',
            details: error.message,
        });
    }
};


//#endregion

//#region empleados
const getAreas = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM areas`;
    try {
        const [catv] = await pool.query(SQL_QUERY);
        res.json(catv);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las areas.'})
    }
}

const createEmpleado = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { id_catv, nombre, apellidos, no_empleado, no_ine, telefono, puesto} = req.body;

    const foto = req.file ? req.file.filename : null;
    const registro = new Date();
    const est = 'A';

    const fechaRegistro = new Date(registro);
    const dia = fechaRegistro.getDate().toString().padStart(2, '0');

    const SQL_INSERT_EMPLEADO = `
        INSERT INTO empleados (id_catv, nombre, apellidos, foto, no_empleado, no_ine, telefono, puesto, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE = `UPDATE empleados SET clave = ? WHERE id_emp = ?`;

    try {
        // Insertar transportista
        const [insertResult] = await pool.query(SQL_INSERT_EMPLEADO, [
            id_catv, nombre, apellidos,  foto, no_empleado, no_ine, telefono, puesto, registro, est
        ]);

        const id_persona = insertResult.insertId;

        const clavePersonalizada = `EC${dia}${id_persona}`;

        await pool.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);

        res.json({
            message: `${clavePersonalizada}`
        });
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

const getEmpleados = async (req, res) => {
    const SQL_QUERY = `SELECT 
    empleados.id_emp,
    empleados.nombre,
    empleados.apellidos,
    empleados.foto,
    empleados.no_empleado,
    empleados.no_ine,
    empleados.telefono,
    empleados.clave,
    empleados.est,
    empleados.puesto,
    categorias_visitas.id_catv,
    categorias_visitas.tipo,
    CONCAT(empleados.nombre, ' ', empleados.apellidos) AS nombre_completo
     FROM empleados
     JOIN categorias_visitas ON empleados.id_catv = categorias_visitas.id_catv
     WHERE empleados.est = 'A'`;
    try {
        const [rest] = await pool.query(SQL_QUERY);
        res.json({empleados: rest});
    } catch (error) {
        res.status(500).json({message: 'Error al obtener empleados.'})
    }
}

const createEmpleadoExcel = async (req, res) => {
    const empleados = req.body;

    const SQL_INSERT_VISITA = `
        INSERT INTO empleados (id_catv, nombre, apellidos, no_empleado, no_ine, telefono, puesto, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE = `UPDATE empleados SET clave = ? WHERE id_emp = ?`;

    const conexion = pool;

    const cleanText = (text) => {
        if (typeof text === 'string') {
            return text.trim().replace(/\s+/g, ' ').toUpperCase();
        }
        return text != null ? String(text).trim().replace(/\s+/g, ' ').toUpperCase() : null;
    };
    

    try {
        for (const item of empleados) {
            const id_catv = 8;
            const nombre = cleanText(item.nombre?.toUpperCase());
            const apellidos = cleanText(item.apellidos?.toUpperCase());
            const no_empleado = cleanText(item.no_empleado);
            const no_ine = cleanText(item.no_ine);
            const telefono = cleanText(item.telefono);
            const puesto = cleanText(item.puesto);
            
            const registro = new Date();
            const est = 'A';

            const [result] = await conexion.query(SQL_INSERT_VISITA, [
                id_catv, nombre, apellidos,no_empleado, no_ine, telefono, puesto, registro, est,
            ]);
            const id_persona = result.insertId;

            const clavePersonalizada = `EC${new Date().getDate().toString().padStart(2, '0')}${id_persona}`;
            await conexion.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);
        }

        res.json({ message: "Datos guardados exitosamente" });
    } catch (error) {
        console.error("Error al guardar los datos:", error);
        res.status(500).json({ message: "Error al guardar los datos", error: error.message });
    }
};
//#endregion

//#region solicitaraccesovehiculo
const getAllPermisos = async (req, res) => {
    const SQL_QUERY = `
    SELECT 
        vehiculo_per.id_vehpr,
        vehiculo_per.id_visit,
        vehiculo_per.id_vit,
        vehiculo_per.id_veh,
        vehiculo_per.motivo_acc,

        visitantes.id_catv,
        visitantes.nombre, 
        visitantes.apellidos ,
        visitas.reg_entrada,
        visitas.hora_entrada,

        categorias_visitas.id_catv,
        categorias_visitas.tipo,
        CONCAT(visitantes.nombre, ' ', visitantes.apellidos) AS nombre_completo

    FROM vehiculo_per
        JOIN visitantes ON vehiculo_per.id_vit = visitantes.clave
        LEFT JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
        LEFT JOIN visitas ON vehiculo_per.id_visit = visitas.id_visit
    WHERE vehiculo_per.acc IS NULL
    GROUP BY vehiculo_per.id_vehpr`;
    try {
        const [vehiculos] = await pool.query(SQL_QUERY)
            
        res.json(vehiculos);
        
    } catch (error) {
        res.status(500).json({message: 'Error al obtener los vehiculos'})
    }
}

const permisosAutos = async(req, res) =>{
    console.log('q', req.body);

    try {
        const { id_vehpr } = req.params; 
        console.log('id_vehpr:', id_vehpr);

        const { acc } = req.body;  
        const fecha_acc = new Date();
        console.log('fecha:', fecha_acc, 'acc:', acc );

        const [vehData] = await pool.query('SELECT id_vehpr FROM vehiculo_per WHERE id_vehpr = ?', [id_vehpr]);

        if (vehData.length === 0) {
            return res.status(404).json({ 
                message: `No se encontró el el vehiculo con id_veh: ${id_vehpr}` 
            });
        }

        const result = await pool.query(
            'UPDATE vehiculo_per SET ? WHERE id_vehpr = ?',
            [{ acc: acc, fecha_acc }, id_vehpr]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: `No se pudo actualizar, id_vehpr: ${id_vehpr} no encontrado` 
            });
        }

        res.status(200).json({ 
            message: 'Datos de permiso actualizados correctamente' 
        });
    } catch (error) {
        console.error('Error al actualizar el permiso:', error);
        res.status(500).json({ 
            message: 'Error al actualizar permiso', 
            error: error.message 
        });
    }
}
//#endregion

//#region multa

const multas = async (req, res) => {
    const SQL_SELECT_MULTAS_VISITAS = `
    SELECT
        multas_visitas.id_mul,
        multas_visitas.id_vit,
        multas_visitas.id_usu_mul, 
        multas_visitas.id_multa,
        multas_visitas.fecha_multa,
        multas_visitas.foto_pago,
        multas_visitas.pago,
        multas_sanciones.sancion_v1,
        multas_sanciones.sancion_v2,
        multas_sanciones.sancion_v3,
        multas_acciones.accion_v1,
        multas_acciones.accion_v2,
        multas_acciones.accion_v3,
        
        multas_acciones.id_accion,
        multas_sanciones.id_sancion,
        visitantes.foto,
        visitantes.nombre,
        visitantes.apellidos ,
        visitantes.empresa,
        visitantes.id_vit,
        categorias_visitas.id_catv,
        categorias_visitas.tipo,
        multas_conceptos.motivo,
        CONCAT(visitantes.nombre, ' ', visitantes.apellidos ) AS nombre_completo,
        (SELECT COUNT(*) FROM multas_visitas mv WHERE mv.id_vit = visitantes.clave) AS total_multas
    FROM multas_visitas 
    JOIN visitantes ON multas_visitas.id_vit = visitantes.clave
    LEFT JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
    LEFT JOIN multas_conceptos ON multas_visitas.id_multa = multas_conceptos.id_multa
    LEFT JOIN multas_sanciones ON multas_conceptos.id_multa = multas_sanciones.id_multa
    LEFT JOIN multas_acciones ON multas_conceptos.id_multa = multas_acciones.id_multa
    WHERE multas_visitas.fecha_multa = (
    SELECT MAX(fecha_multa)
    FROM multas_visitas
    WHERE id_vit = visitantes.clave
)
    GROUP BY multas_visitas.id_vit`;

    const SQL_SELECT_MULTAS_TRANSPORTISTAS = `
    SELECT
        multas_visitas.id_mul,
        multas_visitas.id_vit,
        multas_visitas.id_usu_mul, 
        multas_visitas.id_multa,
        multas_visitas.fecha_multa,
        multas_visitas.pago,
        multas_visitas.foto_pago,
        multas_sanciones.sancion_t1,
        multas_sanciones.sancion_t2,
        multas_sanciones.sancion_t3,
        multas_acciones.accion_t1,
        multas_acciones.accion_t2,
        multas_acciones.accion_t3,
        multas_conceptos.monto_t1,
        multas_conceptos.monto_t2,
        multas_conceptos.monto_t3,
        multas_acciones.id_accion,
        multas_sanciones.id_sancion,
        transportista.id_transp,
        transportista.foto,
        transportista.nombre,
        transportista.apellidos,
        transportista.empresa,
        categorias_visitas.id_catv,
        categorias_visitas.tipo,
        multas_conceptos.motivo,
        CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
        (SELECT COUNT(*) FROM multas_visitas mv WHERE mv.id_vit = transportista.clave) AS total_multas
    FROM multas_visitas 
    JOIN transportista ON multas_visitas.id_vit = transportista.clave
    LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
    LEFT JOIN multas_conceptos ON multas_visitas.id_multa = multas_conceptos.id_multa
    LEFT JOIN multas_sanciones ON multas_conceptos.id_multa = multas_sanciones.id_multa
    LEFT JOIN multas_acciones ON multas_conceptos.id_multa = multas_acciones.id_multa
    WHERE multas_visitas.fecha_multa = (
    SELECT MAX(fecha_multa)
    FROM multas_visitas
    WHERE id_vit = transportista.clave
)
    GROUP BY multas_visitas.id_vit`;

    try {
        const [multa_visitantes] = await pool.query(SQL_SELECT_MULTAS_VISITAS);
        const [multa_transportistas] = await pool.query(SQL_SELECT_MULTAS_TRANSPORTISTAS);

        // Combinar resultados
        const multa = [...multa_visitantes, ...multa_transportistas];

        // Procesar sanciones y acciones dinámicamente
        const procesarMultas = multa.map(item => {
            const totalMultas = parseInt(item.total_multas, 10);

            // Verificar el tipo de sanción/acción según la tabla de origen
            const isTransportista = item.sancion_t1 !== undefined; // Presencia de clave sancion_t1
            const sancionKey = isTransportista ? `sancion_t${totalMultas}` : `sancion_v${totalMultas}`;
            const accionKey = isTransportista ? `accion_t${totalMultas}` : `accion_v${totalMultas}`;
            const montoKey = isTransportista ? `monto_t${totalMultas}` : `monto_t${totalMultas}`; // Similar para ambos casos


            return {
                ...item,
                sancion_actual: item[sancionKey] || null,
                accion_actual: item[accionKey] || null,
                monto_actual: item[montoKey] || null,
            };
        });

        return res.json({ multas: procesarMultas });
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({
            message: 'Error al obtener multas',
            error: error.message,
        });
    }
};

const getMultaDetails = async (req, res) => {
    const { id_vit, id_multa } = req.body; 

    const SQL_QUERY = `
        SELECT 
            multas_sanciones.sancion_t1,
            multas_sanciones.sancion_t2,
            multas_sanciones.sancion_t3,
            multas_acciones.accion_t1,
            multas_acciones.accion_t2,
            multas_acciones.accion_t3,
            multas_conceptos.monto_t1,
            multas_conceptos.monto_t2,
            multas_conceptos.monto_t3,
            multas_conceptos.id_multa,  -- Incluye el id_multa en la consulta
            COUNT(multas_visitas.id_vit) AS total_multas
        FROM 
            multas_visitas
        JOIN 
            multas_conceptos ON multas_visitas.id_multa = multas_conceptos.id_multa
        JOIN 
            multas_sanciones ON multas_conceptos.id_multa = multas_sanciones.id_multa
        JOIN 
            multas_acciones ON multas_conceptos.id_multa = multas_acciones.id_multa
        WHERE 
            multas_visitas.id_vit = ?  -- id del visitante
            AND multas_conceptos.id_multa = ?  -- id_multa que se pasa en el cuerpo
        GROUP BY 
            multas_sanciones.id_multa, 
            multas_acciones.id_multa
    `;

    try {
        const [result] = await pool.query(SQL_QUERY, [id_vit, id_multa]);  

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron multas para este visitante con el motivo id_multa proporcionado.',
            });
        }

        const totalMultas = result[0].total_multas;
        let sancion, accion, monto;

        if (totalMultas === 1) {
            sancion = result[0].sancion_t1;
            accion = result[0].accion_t1;
            monto = result[0].monto_t1;
        } else if (totalMultas === 2) {
            sancion = result[0].sancion_t2;
            accion = result[0].accion_t2;
            monto = result[0].monto_t2;
        } else if (totalMultas >= 3) {
            sancion = result[0].sancion_t3;
            accion = result[0].accion_t3;
            monto = result[0].monto_t3;
        }

        return res.json({
            success: true,
            data: {
                id_multa: result[0].id_multa, 
                sancion: sancion,
                accion: accion,
                monto: monto,
                total_multas: totalMultas,
            },
        });
    } catch (error) {
        console.error('Error al obtener detalles de la multa:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los detalles de la multa',
            error: error.message,
        });
    }
};

const pagarMulta = async (req, res) => {
    const { id_mul } = req.params;
    const { pago } = req.body;
    const foto_pago = req.file ? req.file.filename : null; 

    if (!foto_pago) {
        return res.status(400).json({
            success: false,
            message: 'Se debe proporcionar una foto de pago.',
        });
    }

    const fecha_pago = new Date();
    const SQL_CHECK_MULTA = `SELECT 1 FROM multas_visitas WHERE id_mul = ? AND pago IS NOT NULL`;
    const SQL_UPDATE_MULTA = `UPDATE multas_visitas SET pago = ?, fecha_pago = ?, foto_pago = ? WHERE id_mul = ?`;

    try {
        const [checkMulta] = await pool.query(SQL_CHECK_MULTA, [id_mul]);

        if (checkMulta.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Esta multa ya está pagada.',
            });
        }

        const [updateMulta] = await pool.query(SQL_UPDATE_MULTA, [pago, fecha_pago, foto_pago, id_mul]);

        if (updateMulta.affectedRows > 0) {
            return res.status(200).json({
                success: true,
                message: 'Pago de multa registrado con éxito.',
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la multa especificada.',
            });
        }
    } catch (error) {
        console.error('Error al procesar el pago para la multa con ID:', id_mul, 'Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Ocurrió un error al procesar el pago.',
        });
    }
};


const createMulta = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { id_vit, id_usu_mul, id_multa } = req.body;
    const fecha_multa = new Date();

    const SQL_GET_SANCION = `
        SELECT sancion_v1, sancion_v2, sancion_v3
        FROM multas_sanciones
        WHERE id_multa = ?
    `;

    const SQL_GET_ACCION = `
        SELECT accion_t1, accion_t2, accion_t3
        FROM multas_acciones
        WHERE id_multa = ?
    `;

    const SQL_GET_MULTAS_EXISTENTES = `
        SELECT COUNT(*) as total_multas
        FROM multas_visitas
        WHERE id_vit = ? AND id_multa = ?
    `;

    const SQL_INSERT_MULTA = `
        INSERT INTO multas_visitas (id_vit, id_usu_mul, id_multa, fecha_multa, fecha_acceso, dup) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        // Obtener las sanciones asociadas al id_multa
        const [sanciones] = await pool.query(SQL_GET_SANCION, [id_multa]);
        if (sanciones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la sanción correspondiente para el ID proporcionado.',
            });
        }

        const [acciones] = await pool.query(SQL_GET_ACCION, [id_multa]);
        if (acciones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron las acciones correspondientes para el ID proporcionado.',
            });
        }

        const [conteoMultas] = await pool.query(SQL_GET_MULTAS_EXISTENTES, [id_vit, id_multa]);
        const totalMultas = conteoMultas[0].total_multas;

        let accion = '';
        let diasRestriccion = 0;
        let dup = null;

        // Determinar los días de restricción y la acción según el conteo de multas
        
        if (totalMultas > 3) {
            diasRestriccion = 15;
            accion = acciones[0]?.accion_t3 || '';
            dup = 1; 
        } else if (totalMultas >= 3) {
            // Si hay 3 o más multas, aplicar la acción_t3 (15 días)
            diasRestriccion = 15;
            accion = acciones[0]?.accion_t3 || '';
        } else if (totalMultas === 2) {
            // Si hay 2 multas, aplicar la acción_t2 (10 días)
            diasRestriccion = 10;
            accion = acciones[0]?.accion_t2 || '';
        } else {
            // Si hay menos de 2 multas, aplicar la acción_t1 (5 días)
            diasRestriccion = 5;
            accion = acciones[0]?.accion_t1 || '';
        }

        // Calcular la fecha de restricción excluyendo sábados y domingos
        const calcularFechaRestriccion = (fechaInicio, diasRestriccion) => {
            let diasRestantes = diasRestriccion;
            let fecha_acceso = new Date(fechaInicio);

            while (diasRestantes > 0) {
                fecha_acceso.setDate(fecha_acceso.getDate() + 1); // Avanzar un día
                const diaSemana = fecha_acceso.getDay();
                if (diaSemana !== 0 && diaSemana !== 6) {
                    diasRestantes--; // Restar un día si es laborable
                }
            }

            return fecha_acceso;
        };

        const fecha_acceso = calcularFechaRestriccion(fecha_multa, diasRestriccion);

        await pool.query(SQL_INSERT_MULTA, [id_vit, id_usu_mul, id_multa, fecha_multa, fecha_acceso, dup]);

        return res.json({
            success: true,
            message: `Multa registrada correctamente. ${accion}`,
            data: {
                fecha_acceso,
                diasRestriccion,
                accion,
            },
        });
    } catch (error) {
        console.error('Error al realizar la multa:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al aplicar multa',
            error: error.message,
        });
    }
};

const getMultaDetail = async (req, res) => {
    const { id_vit, id_multa } = req.body;

    const SQL_QUERY = `
        SELECT 
            multas_sanciones.sancion_t1,
            multas_sanciones.sancion_t2,
            multas_sanciones.sancion_t3,
            multas_acciones.accion_t1,
            multas_acciones.accion_t2,
            multas_acciones.accion_t3,
            multas_conceptos.id_multa,
            multas_visitas.fecha_multa, -- Fecha de la multa
            COUNT(multas_visitas.id_vit) AS total_multas
        FROM 
            multas_visitas
        JOIN 
            multas_conceptos ON multas_visitas.id_multa = multas_conceptos.id_multa
        JOIN 
            multas_sanciones ON multas_conceptos.id_multa = multas_sanciones.id_multa
        JOIN 
            multas_acciones ON multas_conceptos.id_multa = multas_acciones.id_multa
        WHERE 
            multas_visitas.id_vit = ? -- id del visitante
            AND multas_conceptos.id_multa = ? -- id_multa que se pasa en el cuerpo
        GROUP BY 
            multas_sanciones.id_multa, 
            multas_acciones.id_multa,
            multas_visitas.fecha_multa
    `;

    try {
        const [result] = await pool.query(SQL_QUERY, [id_vit, id_multa]);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron multas para este visitante con el motivo id_multa proporcionado.',
            });
        }

        const totalMultas = result[0].total_multas;
        const fechaInicio = new Date(result[0].fecha_multa);
        let accion, semanas;

        if (totalMultas === 1) {
            accion = result[0].accion_t1;
            semanas = 1;
        } else if (totalMultas === 2) {
            accion = result[0].accion_t2;
            semanas = 2;
        } else if (totalMultas >= 3) {
            accion = result[0].accion_t3;
            semanas = 3;
        }

        if (!semanas || isNaN(semanas)) {
            return res.status(400).json({
                success: false,
                message: `La acción correspondiente no especifica un número válido de semanas.`,
            });
        }

        const calcularDiasLaborales = (inicio, dias) => {
            let fecha = new Date(inicio);
            let diasLaborales = 0;

            while (diasLaborales < dias) {
                fecha.setDate(fecha.getDate() + 1);
                const diaSemana = fecha.getDay();
                if (diaSemana !== 0 && diaSemana !== 6) {
                    diasLaborales++;
                }
            }

            return fecha; 
        };

        const diasLaboralesRequeridos = semanas * 5; 
        const fechaFinal = calcularDiasLaborales(fechaInicio, diasLaboralesRequeridos);
        const fechaActual = new Date();

        const sancionCumplida = fechaActual >= fechaFinal;

        return res.json({
            success: true,
            data: {
                id_multa: result[0].id_multa,
                accion,
                total_multas: totalMultas,
                fecha_multa: fechaInicio,
                fecha_fin_sancion: fechaFinal,
                sancionCumplida,
            },
        });
    } catch (error) {
        console.error('Error al obtener detalles de la multa:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los detalles de la multa',
            error: error.message,
        });
    }
};

//#endregion

//#region transportistas
const getTransportistas = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM transportista`;
    try {
        const [transportistas] = await pool.query(SQL_QUERY)
            
        res.json(transportistas);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener los transportistas'})
    }
}

const createTransportista = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const {
        id_catv, nombre, apellidos, empresa, telefono, no_licencia,
        no_ine} = req.body;

    const foto = req.file ? req.file.filename : null;
    const registro = new Date();
    const est = 'A';

    const fechaRegistro = new Date(registro);
    const dia = fechaRegistro.getDate().toString().padStart(2, '0');

    const SQL_INSERT_TRANSPORTISTA = `
        INSERT INTO transportista (id_catv, nombre, apellidos, empresa, telefono, foto, no_licencia, no_ine, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE = `UPDATE transportista SET clave = ? WHERE id_transp = ?`;

    try {
        // Definir prefijo basado en id_catv
        let prefijoClave;
        if (id_catv === 6) {
            prefijoClave = 'MN'; // Para id_catv = 6
        } else if (id_catv === 5) {
            prefijoClave = 'TR'; // Para id_catv = 5
        } else {
            throw new Error("id_catv no es válido. Debe ser 5 o 6.");
        }

        // Insertar transportista
        const [insertResult] = await pool.query(SQL_INSERT_TRANSPORTISTA, [
            id_catv, nombre, apellidos, empresa, telefono, foto, no_licencia, no_ine, registro, est
        ]);

        const id_persona = insertResult.insertId;

        // Crear clave personalizada
        const clavePersonalizada = `${prefijoClave}${dia}${id_persona}`;

        // Actualizar clave en la base de datos
        await pool.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);

        // Responder con el tipo y la clave generada
        res.json({
            tipo: prefijoClave,
            message: `${clavePersonalizada}`
        });
    } catch (error) {
        // Manejo de errores
        if (foto) {
            fs.unlink(path.join('C:/acc-ced', foto), (err) => {
                if (err) console.error("Error al eliminar el archivo:", err);
            });
        }

        console.error('Error al registrar transportista:', error);
        res.status(500).json({ message: 'Error al registrar', error: error.message });
    }
};

const createTransportistaExcel = async (req, res) => {
    const transportistas = req.body;

    const SQL_INSERT_VISITA = `
        INSERT INTO transportista (id_catv, nombre, apellidos, empresa, telefono, no_licencia, no_ine, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE = `UPDATE transportista SET clave = ? WHERE id_transp = ?`;

    const conexion = pool;

    // Función para limpiar texto: elimina espacios adicionales y convierte a mayúsculas
    const cleanText = (text) => {
        if (typeof text === 'string') {
            return text.trim().replace(/\s+/g, ' ').toUpperCase();
        }
        return text != null ? String(text).trim().replace(/\s+/g, ' ').toUpperCase() : null;
    };
    

    try {
        for (const item of transportistas) {
            const id_catv = 5;
            const nombre = cleanText(item.nombre?.toUpperCase());
            const apellidos = cleanText(item.apellidos?.toUpperCase());
            const empresa = cleanText(item.empresa?.toUpperCase());
            const telefono = cleanText(item.telefono);
            const no_licencia = cleanText(item.no_licencia);
            const no_ine = cleanText(item.no_ine);
            const registro = new Date();
            const est = 'A';

            const [result] = await conexion.query(SQL_INSERT_VISITA, [
                id_catv, nombre, apellidos, empresa, telefono, no_licencia, no_ine, registro, est,
            ]);
            const id_persona = result.insertId;

            const clavePersonalizada = `TR${new Date().getDate().toString().padStart(2, '0')}${id_persona}`;
            await conexion.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);
        }

        res.json({ message: "Datos guardados exitosamente" });
    } catch (error) {
        console.error("Error al guardar los datos:", error);
        res.status(500).json({ message: "Error al guardar los datos", error: error.message });
    }
};



const getCategoriasMT = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM categorias_visitas WHERE id_catv = 5 OR id_catv = 6`;
    try {
        const [catv] = await pool.query(SQL_QUERY);
        res.json(catv);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las categorias.'})
    }
}
//#endregion
//#region vehiculos
const getAllVehiculos = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM vehiculos`;
    try {
        const [vehiculos] = await pool.query(SQL_QUERY);
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener vehiculos.'})
    }
}

const createVehiculo = async (req, res) => {
    const { empresa, marca, modelo, placa, anio, seguro } = req.body;
    const registro = new Date();
    const est = 'A';

    // Consulta SQL
    const SQL_INSERT_VEHICULO = `
        INSERT INTO vehiculos (empresa, marca, modelo, placa, anio, seguro, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        // Inserción en la base de datos
        await pool.query(SQL_INSERT_VEHICULO, [
            empresa, marca, modelo, placa, anio, seguro, registro, est,
        ]);

        // Respuesta de éxito
        res.status(201).json({
            message: 'Vehículo registrado exitosamente',
            vehiculo: { empresa, marca, modelo, placa, anio, seguro, registro, est },
        });
    } catch (error) {
        // Manejo de errores
        console.error('Error al registrar el vehículo:', error);
        res.status(500).json({
            message: 'Error al registrar el vehículo',
            error: error.message,
        });
    }
};

const createVehiculosExcel = async (req, res) => {
    const vehiculos = req.body;

    const SQL_INSERT_VEHICULO = `
        INSERT INTO vehiculos (empresa, marca, modelo, placa, anio, seguro, registro, est)
        VALUES (?, ?, ?, ?, ?, ?,?,?)
    `;

    const conexion = pool;

    try {
        for (const item of vehiculos) {
            const cleanText = (text) => {
                return text ? String(text).trim().replace(/\s+/g, ' ').toUpperCase() : null;
            };
            
            const empresa = cleanText(item.empresa);
            const marca = cleanText(item.marca);
            const modelo = cleanText(item.modelo);
            const placa = cleanText(item.placa);
            const anio = item.anio ? parseInt(cleanText(item.anio), 10) : null;
            const seguro = cleanText(item.seguro);
            
            const registro = new Date();
            const est = 'A';

            await conexion.query(SQL_INSERT_VEHICULO, [
                empresa, marca, modelo, placa, anio, seguro, registro, est,
            ]);
        }

        res.json({ message: "Datos guardados exitosamente" });
    } catch (error) {
        console.error("Error al guardar los datos:", error);
        res.status(500).json({ message: "Error al guardar los datos", error: error.message });
    }
};
//#endregion
const getCategorias = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM categorias_visitas WHERE id_catv != 5 AND id_catv != 6 AND id_catv != 8`;
    try {
        const [catv] = await pool.query(SQL_QUERY);
        res.json(catv);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las categorias.'})
    }
}

const getConceptosMultas = async (req, res) => {
    const SQL_QUERY = `SELECT multas_conceptos.id_multa, multas_conceptos.motivo FROM multas_conceptos`;
    try {
        const [concep] = await pool.query(SQL_QUERY);
        res.json(concep);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener los conceptos.'})
    }
} 

const actividadVigilancia = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { id_us, codigo_generado, codigo_ingresado, coincidencia } = req.body;
    const fecha = new Date();

    let nuevoCodigoGenerado = codigo_generado;

    // Verifica si los códigos no coinciden y genera un nuevo código
    if (codigo_generado !== codigo_ingresado) {
        nuevoCodigoGenerado = Math.floor(1000 + Math.random() * 9000); // Nuevo código generado
    }

    const SQL_INSERT_ACTIVIDAD = `
        INSERT INTO vigilante_activo (id_us, codigo_generado, codigo_ingresado, coincidencia, fecha)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
        await pool.query(SQL_INSERT_ACTIVIDAD, [id_us, codigo_generado, codigo_ingresado, coincidencia, fecha]);

        return res.json({
            success: true,
            message: 'Actividad registrada.',
            nuevoCodigoGenerado  
        });
    } catch (error) {
        console.error('Error en la operación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor al registrar la visita.',
        });
    }
};

const getActividadVigilancia = async (req, res) => {
    const SQL_QUERY = `SELECT vigilante_activo.fecha FROM vigilante_activo ORDER BY fecha DESC LIMIT 1 `
    try {
        const [fechaActividad] = await pool.query(SQL_QUERY);
        if (fechaActividad.length > 0) {
            res.json(fechaActividad[0]);
        } else {
            res.status(404).json({ message: 'No se encontró registro de actividad.' });
        }
    } catch (error) {
        res.status(500).json({message: 'Error al obtener la fecha.'})
    }
}

module.exports = { createVisita, pasarValidar, darAccesoVisitante, getVisitas, getVisitasAct, getVisitasReporte, getVisitantes,getVisitanteId, 
    createVisitante, getTransportistas, createTransportista, getCategorias, updateVisitante, createTransportistaExcel, darSalidaVisitante, 
    getAllPermisos, permisosAutos, createMulta, multas, getMultaDetails, getMultaDetail, visitantesAll, getCategoriasMT, getAllVehiculos, createVehiculosExcel, updateInfoVisitantes,
    updateClave, getConceptosMultas, getProveedores, createVisitaProveedor, actividadVigilancia, getActividadVigilancia, updateInfoVisitantesVehiculo,
    validacionVehiculo, validacionProveedor, pagarMulta, createEmpleado, getAreas, getEmpleados,createEmpleadoExcel, createVehiculo, upload, uploadImgVehiculo,uploadImgPagos, }