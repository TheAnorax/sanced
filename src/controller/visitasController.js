
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse, format, isValid } = require('date-fns');
const { Console } = require('console');

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
            visitas.id_vit, 
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
            visitas.validar, 
            vehiculos.id_veh,
            vehiculos.placa,
            vehiculos.acc_dir,
            visitas.validado,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            vehiculo_per.id_vehpr,
            vehiculo_per.id_vit,
            vehiculo_per.acc,
            contenedores_visitas.id_cont,
            contenedores_visitas.contenedor,
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
        LEFT JOIN contenedores_visitas ON visitas.id_vit = contenedores_visitas.id_cont
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
            visitas.id_vit, 
            visitas.reg_entrada, 
            visitas.reg_salida,
            visitas.hora_entrada,
            visitas.entrada_h,
            visitas.id_visit,
            visitas.est,
            visitas.clave_visit,
            visitas.acc_veh,
            visitas.llegada,
            visitas.validar, 
            visitas.validado,
            visitas.personal,
            vehiculos.id_veh,
            vehiculos.placa,
            vehiculos.acc_dir,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            cortinas.id_cor,
            cortinas.area,
            paqueterias.id_paq,
            paqueterias.paqueteria,
            vehiculos_fotos.img1,
            CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp
        FROM visitas
        JOIN transportista ON visitas.id_vit = transportista.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
        LEFT JOIN cortinas ON visitas.area_per = cortinas.id_cor
        LEFT JOIN vehiculos_fotos ON visitas.id_visit = vehiculos_fotos.id_visit
        LEFT JOIN paqueterias ON transportista.empresa  = paqueterias.id_paq
        WHERE DATE(visitas.reg_entrada) = CURRENT_DATE
            AND visitas.reg_salida IS NULL 
            GROUP BY visitas.id_visit
    `;

    const SQL_QUERY_CONTENEDORES = `
        SELECT 
            contenedores_visitas.id_cont,
            contenedores_visitas.id_catv,
            contenedores_visitas.contenedor,
            contenedores_visitas.clave,
            recibo_compras.id_recibo,
            recibo_compras.contenedor,
            recibo_compras.naviera,
            recibo_compras.arribo as reg_entrada,
            recibo_compras.tipo as tipoCom,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            visitas.id_vit, 
            visitas.entrada_h,
            visitas.id_visit,
            visitas.acc_veh,
            visitas.motivo,
            visitas.area_per,
            visitas.llegada, 
            visitas.validar, 
            visitas.clave_visit,
            visitas.validado,
            visitas.personal,
            areas.id_area,
            areas.area,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            acomp.foto,
            vehiculos_fotos.img1,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_com_acomp
        FROM visitas
        JOIN contenedores_visitas ON visitas.id_vit = contenedores_visitas.clave
        JOIN categorias_visitas ON contenedores_visitas.id_catv = categorias_visitas.id_catv
        JOIN recibo_compras ON contenedores_visitas.contenedor = recibo_compras.contenedor
        JOIN areas ON visitas.area_per = areas.id_area
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN vehiculos_fotos ON visitas.id_visit = vehiculos_fotos.id_visit
        WHERE DATE(visitas.reg_entrada) = CURRENT_DATE
            AND visitas.reg_salida IS NULL
            AND contenedores_visitas.arribo IS NOT NULL
        GROUP BY visitas.id_visit
    `;

    try {

        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);
        const [resultContenedores] = await pool.query(SQL_QUERY_CONTENEDORES);

        //const visitasActivas = [...resultVisitantes, ...resultTransportistas];
        res.json({
            visitantes: resultVisitantes,
            transportistas: resultTransportistas,
            contenedores: resultContenedores,
        });
    } catch (error) {
        console.error('Error en las consultas:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
};

const getVisitasHoy = async (req, res) => {
    const SQL_QUERY_VISITANTES = `
        SELECT 
            visitantes.id_catv,
            visitantes.nombre,  
            visitantes.apellidos,  
            visitantes.empresa, 
            visitantes.foto,
            visitantes.clave,
            visitas.id_vit, 
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
            visitas.validar, 
            vehiculos.id_veh,
            vehiculos.placa,
            vehiculos.acc_dir,
            visitas.validado,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            vehiculo_per.id_vehpr,
            vehiculo_per.id_vit,
            vehiculo_per.acc,
            contenedores_visitas.id_cont,
            contenedores_visitas.contenedor,
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
        LEFT JOIN contenedores_visitas ON visitas.id_vit = contenedores_visitas.id_cont
        LEFT JOIN areas ON visitas.area_per = areas.id_area
        WHERE DATE(visitas.reg_entrada) = CURRENT_DATE
            AND visitas.reg_salida IS NULL
            AND visitas.est IS NULL
            GROUP BY visitas.id_visit
    `;

    try {
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);

        res.json({
            visitantesHoyRH: resultVisitantes
        });
    } catch (error) {
        console.error('Error en las consultas:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
};

const getVisitasVehiculoValidado = async (req, res) => {
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
            visitas.validar, 
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
            contenedores_visitas.id_cont,
            contenedores_visitas.contenedor,
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
        LEFT JOIN contenedores_visitas ON visitas.id_vit = contenedores_visitas.id_cont
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
            visitas.validar, 
            visitas.validado,
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
            paqueterias.id_paq,
            paqueterias.paqueteria,
            vehiculos_fotos.img1,
            CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp
        FROM visitas
        JOIN transportista ON visitas.id_vit = transportista.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
        LEFT JOIN areas ON visitas.area_per = areas.id_area
        LEFT JOIN vehiculos_fotos ON visitas.id_visit = vehiculos_fotos.id_visit
        LEFT JOIN paqueterias ON transportista.empresa  = paqueterias.id_paq
        WHERE DATE(visitas.reg_entrada) = CURRENT_DATE
            AND visitas.reg_salida IS NULL
            GROUP BY visitas.id_visit
    `;

    const SQL_QUERY_CONTENEDORES = `
        SELECT 
            contenedores_visitas.id_cont,
            contenedores_visitas.id_catv,
            contenedores_visitas.contenedor,
            contenedores_visitas.clave,
            recibo_compras.id_recibo,
            recibo_compras.contenedor,
            recibo_compras.naviera,
            recibo_compras.arribo as reg_entrada,
            recibo_compras.tipo as tipoCom,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            visitas.entrada_h,
            visitas.id_visit,
            visitas.acc_veh,
            visitas.motivo,
            visitas.area_per,
            visitas.llegada, 
            visitas.validar, 
            visitas.clave_visit, 
            visitas.validado,
            areas.id_area,
            areas.area,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            acomp.foto,
            vehiculos_fotos.img1,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_com_acomp
        FROM visitas
        JOIN contenedores_visitas ON visitas.id_vit = contenedores_visitas.clave
        JOIN categorias_visitas ON contenedores_visitas.id_catv = categorias_visitas.id_catv
        JOIN recibo_compras ON contenedores_visitas.contenedor = recibo_compras.contenedor
        JOIN areas ON visitas.area_per = areas.id_area
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN vehiculos_fotos ON visitas.id_visit = vehiculos_fotos.id_visit
        WHERE DATE(visitas.reg_entrada) = CURRENT_DATE
            AND visitas.reg_salida IS NULL
            AND contenedores_visitas.arribo IS NOT NULL
        GROUP BY visitas.id_visit
    `;

    try {

        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);
        const [resultContenedores] = await pool.query(SQL_QUERY_CONTENEDORES);

        //const visitasActivas = [...resultVisitantes, ...resultTransportistas];
        res.json({
            visitantes: resultVisitantes,
            transportistas: resultTransportistas,
            contenedores: resultContenedores,
        });
    } catch (error) {
        console.error('Error en las consultas:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
};

const createVisita = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { reg_entrada, hora_entrada, id_vit, motivo, area_per, personal, acompanantes, access, id_veh, motivo_acc } = req.body;

    const cleanString = (str) => (str ? str.trim().replace(/\s+/g, ' ') : '');

    const cleanedMotivo = cleanString(motivo);
    const cleanedPersonal = cleanString(personal);
    const cleanedMotivoAcc = cleanString(motivo_acc);

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
        INSERT INTO acomp (nombre_acomp, apellidos_acomp, no_ine_acomp, id_vit, id_visit, clave_visit) 
        VALUES ?
    `;
    const SQL_INSERT_ACCESO_VEHICULO = `
        INSERT INTO vehiculo_per (id_visit, id_vit, id_veh, motivo_acc) 
        VALUES (?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE_VISITA = `
        UPDATE visitas SET clave_visit = ? WHERE id_vit = ?
    `;
    const SQL_UPDATE_CLAVE_ACCESO = `
        UPDATE visitas SET acc_veh = ? WHERE id_vit = ?
    `;

    try {
        const [checkResult] = await pool.query(SQL_CHECK_VISIT, [id_vit, reg_entrada]);
        if (checkResult.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Este invitado ya tiene una visita registrada para la fecha indicada.',
            });
        }

        const [insertResult] = await pool.query(SQL_INSERT_VISIT, [
            id_vit, reg_entrada, hora_entrada, cleanedMotivo, area_per, cleanedPersonal,
        ]);
        const visitaId = insertResult.insertId;

        const prefix = id_vit.startsWith('TR') ? 'TR' : id_vit.startsWith('VT') ? 'VT' : 'GEN';
        const random = Math.floor(1000 + Math.random() * 900).toString();
        const claveVisita = `${prefix}${random}${visitaId}`;

        await pool.query(SQL_UPDATE_CLAVE_VISITA, [claveVisita, id_vit]);

        if (access === 1) {
            await pool.query(SQL_INSERT_ACCESO_VEHICULO, [visitaId, id_vit, id_veh, cleanedMotivoAcc]);
        }

        if (acompanantes && acompanantes.length > 0) {
            const values = acompanantes.map(acomp => [
                acomp.nombre_acomp, acomp.apellidos_acomp, acomp.no_ine_acomp, id_vit, visitaId, claveVisita
            ]);
            await pool.query(SQL_INSERT_ACOMPANANTES, [values]);

            return res.json({
                success: true,
                message: 'Visita y acompañantes registrados correctamente.',
                data: { id_vit, reg_entrada, hora_entrada, motivo: cleanedMotivo, area_per, personal, acompanantes, claveVisita },
            });
        }

        if (['TR', 'PR'].includes(prefix)) {
            await pool.query(SQL_UPDATE_CLAVE_ACCESO, ['S', id_vit]);
        }

        return res.json({
            success: true,
            message: 'Visita registrada correctamente sin acompañantes.',
            data: { id_vit, reg_entrada, hora_entrada, motivo: cleanedMotivo, area_per, personal, claveVisita },
        });

    } catch (error) {
        console.error('Error en la operación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor al registrar la visita.',
        });
    }
};

const createVisitaPaqueteria = async (req, res) => {
  console.log('Cuerpo de la solicitud:', req.body);
  const { id_catv, nombre, apellidos, empresa, no_licencia, no_ine,  motivo, area_per, id_vit, marca, placa, acompanantesPaq, area_per2, motivo2 } = req.body;

  const registro = new Date();
  const fechaRegistro = new Date(registro);
  const anio = registro.getFullYear();
  const mes = (registro.getMonth() + 1).toString().padStart(2, '0');
  const dia = fechaRegistro.getDate().toString().padStart(2, '0');
  const fechaFormato = `${anio}-${mes}-${dia}`;
  const est = 'A';
  const acc_dir = 'S';
  const acc_veh = 'S';
  const llegada = 'S';
  const validar = 'S';
  const personal = 'KARLA';

  const cleanString = (str) => (typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '');
  const cleanedNombre = cleanString(nombre);
  const cleanedApellidos = cleanString(apellidos);
  const cleanedEmpresa = cleanString(empresa);
  const cleanedLicencia = cleanString(no_licencia);
  const cleanedMarca = cleanString(marca);
  const cleanedPlaca = cleanString(placa);
  const cleanedNoine = cleanString(no_ine);
  const cleanedMotivo = cleanString(motivo);

  const generarClave = (id_catv, dia, id_persona) => {
    const prefijo = id_catv === 7 ? 'PQ' : id_catv === 11 ? 'CR' : id_catv === 13 ? 'VPR' : 'GEN';
    return `${prefijo}${dia}${id_persona}`;
  };

  try {
    let transportistaId;
    let clavePersonalizada;
    let placaId;

    // Buscar si existe el transportista
    const [existingTransportista] = await pool.query(
      `SELECT id_transp FROM transportista WHERE nombre = ? AND apellidos = ?`,
      [cleanedNombre, cleanedApellidos]
    );

    if (existingTransportista.length > 0) {
      // Ya existe: actualizar información
      transportistaId = existingTransportista[0].id_transp;
      await pool.query(
        `UPDATE transportista 
         SET empresa = ?, no_licencia = ?, no_ine = ?, registro = ?, est = ?
         WHERE id_transp = ?`,
        [cleanedEmpresa, cleanedLicencia, cleanedNoine, fechaRegistro, est, transportistaId]
      );
    } else {
      // Insertar nuevo transportista
      const [insertVisitante] = await pool.query(
        `INSERT INTO transportista (id_catv, nombre, apellidos, empresa, no_licencia, no_ine, registro, est)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id_catv, cleanedNombre, cleanedApellidos, cleanedEmpresa, cleanedLicencia, cleanedNoine, registro, est]
      );
      transportistaId = insertVisitante.insertId;
    }

    // Clave personalizada (si ya tiene, no la regeneramos)
    const [resultClave] = await pool.query(
      `SELECT clave FROM transportista WHERE id_transp = ?`,
      [transportistaId]
    );

    clavePersonalizada = resultClave[0].clave;
    if (!clavePersonalizada) {
      clavePersonalizada = generarClave(id_catv, dia, transportistaId);
      await pool.query(`UPDATE transportista SET clave = ? WHERE id_transp = ?`, [clavePersonalizada, transportistaId]);
    }

    // Vehículo
    // Buscar si existe el transportista
    const [existingPlaca] = await pool.query(
      `SELECT id_veh FROM vehiculos WHERE placa = ?`,
      [cleanedPlaca]
    );

    if (existingPlaca.length > 0) {
      placaId = existingPlaca[0].id_veh;
      await pool.query(
        `UPDATE vehiculos 
         SET empresa = ?, marca = ?, placa = ?, est = ?, clave_con = ?, acc_dir = ?
         WHERE id_veh = ?`,
        [cleanedEmpresa, cleanedMarca, cleanedPlaca, est, clavePersonalizada, acc_dir, placaId]
      );
    } else {
      // Insertar nuevo transportista
      await pool.query(
        `INSERT INTO vehiculos (empresa, marca, placa, registro, est, clave_con, acc_dir)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [cleanedEmpresa, cleanedMarca, cleanedPlaca, registro, est, clavePersonalizada, acc_dir]
      );
    }

    // if (placa) {
    //   await pool.query(
    //     `INSERT INTO vehiculos (empresa, marca, placa, registro, est, clave_con, acc_dir)
    //      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    //     [cleanedEmpresa, cleanedMarca, cleanedPlaca, registro, est, clavePersonalizada, acc_dir]
    //   );
    // }

    // Visita
    const prefix = clavePersonalizada.substring(0, 3);
    const random = Math.floor(1000 + Math.random() * 900).toString();
    const claveVisita = `${prefix}${random}${transportistaId}`;
    const [insertVisita] = await pool.query(
      `INSERT INTO visitas (id_vit, reg_entrada, motivo, area_per, personal, clave_visit, acc_veh, llegada, hora_llegada, validar, area_per2, motivo2)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clavePersonalizada, fechaFormato, cleanedMotivo, area_per, personal, claveVisita, acc_veh, llegada, registro, validar, area_per2, motivo2]
    );
    const visitaId = insertVisita.insertId;

    // Acompañantes
    if (acompanantesPaq && acompanantesPaq.length > 0) {
      const values = acompanantesPaq.map(acomp => [
        acomp.nombre_acomp, acomp.apellidos_acomp, acomp.no_ine_acomp, clavePersonalizada, visitaId, claveVisita
      ]);
      await pool.query(
        `INSERT INTO acomp (nombre_acomp, apellidos_acomp, no_ine_acomp, id_vit, id_visit, clave_visit)
         VALUES ?`,
        [values]
      );
    }

    return res.json({
      success: true,
      message: existingTransportista.length > 0
        ? 'Transportista actualizado y visita registrada correctamente.'
        : 'Transportista y visita registrados correctamente.',
      data: {
        clavePersonalizada,
        claveVisita,
        transportistaId,
        visitaId
      }
    });
  } catch (error) {
    console.error('Error en la operación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error del servidor al registrar la visita.',
    });
  }
};

const updatePaqueteria = async (req, res) => {
  console.log('Cuerpo de la solicitud:', req.body);
  const { clave_visit} = req.params;
  const { motivo, area_per } = req.body;
  const SQL_UPDATE_INFORMACION = `UPDATE visitas SET area_per = ?, motivo = ? WHERE clave_visit = ?`;

  try {
    await pool.query(SQL_UPDATE_INFORMACION, [area_per, motivo, clave_visit]);

    return res.json({
      success: true,
      message: 'Cortina asignada correctamente.'
    });
  } catch (error) {
    console.error('Error en la operación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error del servidor al asignar la cortina.',
    });
  }
};

const createVisitaProveedor = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    let { reg_entrada, hora_entrada, id_vit, motivo, personal, contenedor, naviera } = req.body;
    let area_per = '9';

    const cleanString = (str) => str?.trim().replace(/\s+/g, ' ') || '';
    motivo = cleanString(motivo); 
    personal = cleanString(personal); 
    contenedor = cleanString(contenedor);
    naviera = cleanString(naviera);

    // SQL Queries
    const SQL_INSERT_VISIT = `
        INSERT INTO visitas (id_vit, reg_entrada, hora_entrada, motivo, area_per, personal, rango_horas)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const SQL_UPDATE_CLAVE_VISITA = `UPDATE visitas SET clave_visit = ? WHERE id_vit = ?`;
    const SQL_UPDATE_CLAVE_ACCESO = `UPDATE visitas SET acc_veh = ? WHERE id_vit = ?`;

    try {
        // Validar el formato de fecha y hora
        const entradaCompleta = `${reg_entrada} ${hora_entrada}`;
        console.log('Fecha y hora combinadas:', entradaCompleta);

        const horaEntrada = parse(entradaCompleta, 'yyyy-MM-dd hh:mm a', new Date());
        if (!isValid(horaEntrada)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de fecha u hora inválido. Verifique reg_entrada y hora_entrada.',
            });
        }

        // Verificar si ya existe una visita para el día
        // const [checkResult] = await pool.query(SQL_CHECK_VISIT, [id_vit, reg_entrada]);
        // if (checkResult.length > 0) {
        //     return res.status(400).json({
        //         success: false,
        //         error: 'Este invitado ya tiene una visita registrada para la fecha indicada.',
        //     });
        // }

        // Calcular el rango de horas
        const horaSalida = new Date(horaEntrada);
        horaSalida.setHours(horaSalida.getHours() + 24);
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
        if (id_vit.startsWith('PR') || id_vit.startsWith('VPR') || id_vit.startsWith('TR')) {
            await pool.query(SQL_UPDATE_CLAVE_ACCESO, ['S', id_vit]);
        }

        // Insertar contenedor si es un proveedor
        // if (contenedor) {
        //     await pool.query(SQL_INSERT_CONTENEDOR, [id_vit, contenedor, naviera]);
        // }

        return res.json({
            success: true,
            message: 'Visita registrada correctamente.',
        });
    } catch (error) {
        console.error('Error en la operación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al registrar la visita.',
        });
    }
};

const cancelarVisita = async (req, res) => {
    const SQL_CANCELAR_VISITAS = `UPDATE visitas SET est = ?  WHERE id_visit = ? `;
    try {
        const { id_visit } = req.params;
        const { est } = req.body; 
        await pool.query(SQL_CANCELAR_VISITAS,[est, id_visit]);
        console.log('Visitas cancelada exitosamente.');
        res.status(200).json({ 
            message: 'Visita cancelada correctamente.' ,
            visita: {
                id_visit: id_visit,
                est: est
            },
        });
    } catch (error) {
        console.error('Error en las consultas:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
};
//cancelarVisita();

// Programar la función para que se ejecute cada hora (3600000 ms)
//  setInterval(async () => {
//      console.log('Ejecutando la cancelación de visitas cada hora');
//      await cancelarVisita();
//  }, 3600000);

const validacionVehiculo = async (req, res) => {
    console.log('Request up body:', req.body);
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

    const SQL_UPDATE_VALIDACION_VEHICULO = `
      UPDATE visitas SET validado = 'S' WHERE id_visit = ?
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

        await pool.query(SQL_UPDATE_VALIDACION_VEHICULO, [id_visit]);

        res.status(201).json({
            message: 'Imágenes guardadas y validación actualizada correctamente.',
            data: {
                imgVehiculoId: resultImgVehiculo.insertId,
                id_veh,
                id_visit,
                comentario,
            },
        });
    } catch (error) {
        
        console.error('Error al guardar las imágenes o actualizar la validación:', error);

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

    const SQL_INSERT_CONDUCTOR = `
      INSERT INTO acomp 
      (nombre_acomp, apellidos_acomp, no_ine_acomp, id_vit, id_visit, clave_visit, foto, proveedor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {

      const [resultConductor] = await pool.query(SQL_INSERT_CONDUCTOR, [
        nombre_acomp, 
        apellidos_acomp, 
        no_ine_acomp, 
        id_vit, 
        id_visit, 
        clave_visit,
        foto,
        proveedor
      ]);
      
      res.status(201).json({
        message: 'Imágenes y conductor guardados correctamente.',
        data: {
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
    const SQL_PASAR_A_VALIDAR = `UPDATE visitas SET validar = ? WHERE id_visit = ?`;
    try {
        const { id_visit } = req.params; 
        const { validar } = req.body; 
        const [result] = await pool.query(SQL_PASAR_A_VALIDAR, [validar, id_visit]);

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

const pasarLlegada = async (req, res) => { 
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

        if (id_vit.startsWith('PR') || id_vit.startsWith('TR') || id_vit.startsWith('VPR')) {
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

const registrarAcompañantes = async (req, res) => { 
    console.log('Cuerpo de la solicitud:', req.body);
    const { nombre_acomp, apellidos_acomp, no_ine_acomp, nombre_acomp2, apellidos_acomp2, no_ine_acomp2, id_vit, id_visit, clave_visit } = req.body;

    const cleanString = (str) => (str ? str.trim().replace(/\s+/g, ' ') : '');
    const cleanedNombre = cleanString(nombre_acomp);
    const cleanedApellidos = cleanString(apellidos_acomp);
    const cleanedNoIne = cleanString(no_ine_acomp);
    
    const cleanedNombre2 = cleanString(nombre_acomp2);
    const cleanedApellidos2 = cleanString(apellidos_acomp2);
    const cleanedNoIne2 = cleanString(no_ine_acomp2);

    const SQL_INSERT_ACOMPANANTES = `
        INSERT INTO acomp (nombre_acomp, apellidos_acomp, no_ine_acomp, id_vit, id_visit, clave_visit) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        await pool.query(SQL_INSERT_ACOMPANANTES, [cleanedNombre, cleanedApellidos, cleanedNoIne, id_vit, id_visit, clave_visit]);

        // Insertar segundo acompañante solo si tiene valores en todos sus campos
        if (cleanedNombre2 && cleanedApellidos2 && cleanedNoIne2) {
            await pool.query(SQL_INSERT_ACOMPANANTES, [cleanedNombre2, cleanedApellidos2, cleanedNoIne2, id_vit, id_visit, clave_visit]);
        }

        return res.json({
            success: true,
            message: 'Acompañante(s) registrado(s) correctamente.',
        });

    } catch (error) {
        console.error('Error en la operación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor al registrar acompañantes.',
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
            visitas.validado,
            vehiculos.id_veh,
            vehiculos.placa,
            vehiculos.acc_dir,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            vehiculo_per.id_vehpr,
            vehiculo_per.acc,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            contenedores_visitas.id_cont,
            contenedores_visitas.contenedor,
            areas.id_area,
            areas.area,
            CONCAT(visitantes.nombre, ' ', visitantes.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp
        FROM visitas
        JOIN visitantes ON visitas.id_vit = visitantes.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON visitantes.id_catv = categorias_visitas.id_catv
        LEFT JOIN contenedores_visitas ON visitantes.clave = contenedores_visitas.id_cont
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
            visitas.area_per2,
            visitas.id_visit,
            visitas.id_vit,
            visitas.est,
            visitas.personal,
            visitas.motivo,
            visitas.motivo2,
            visitas.clave_visit,
            visitas.entrada_h,
            visitas.acc_veh,
            visitas.validado,
            vehiculos.id_veh,
            vehiculos.placa,
            vehiculos.acc_dir,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            cortinas.id_cor,
            cortinas.area,
            cortinas.cortina,
            cortinas2.id_cor AS id_cor2,
            cortinas2.area AS area2,
            cortinas2.cortina AS cortina2,
            paqueterias.id_paq,
            paqueterias.paqueteria,
            vehiculos_fotos.img1,
            CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_acomp
        FROM visitas
        JOIN transportista ON visitas.id_vit = transportista.clave
        LEFT JOIN vehiculos ON visitas.id_vit = vehiculos.clave_con
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
        LEFT JOIN cortinas ON visitas.area_per = cortinas.id_cor
        LEFT JOIN cortinas AS cortinas2 ON visitas.area_per2 = cortinas2.id_cor 
        LEFT JOIN paqueterias ON transportista.empresa  = paqueterias.id_paq
        LEFT JOIN vehiculos_fotos ON visitas.id_visit = vehiculos_fotos.id_visit
        WHERE visitas.est = 'A'
        GROUP BY visitas.id_visit
    `;

    const SQL_QUERY_CONTENEDORES = `
        SELECT 
            contenedores_visitas.id_cont,
            contenedores_visitas.id_catv,
            contenedores_visitas.contenedor,
            contenedores_visitas.clave,
            recibo_compras.id_recibo,
            recibo_compras.contenedor,
            recibo_compras.naviera,
            recibo_compras.arribo as reg_entrada,
            recibo_compras.tipo as tipoCom,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            visitas.entrada_h,
            visitas.id_visit,
            visitas.acc_veh,
            visitas.motivo,
            visitas.area_per,
            visitas.llegada, 
            visitas.validar, 
            visitas.clave_visit, 
            visitas.reg_salida,
            visitas.validado,
            areas.id_area,
            areas.area,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            acomp.foto,
            vehiculos_fotos.img1,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_com_acomp
        FROM visitas
        JOIN contenedores_visitas ON visitas.id_vit = contenedores_visitas.clave
        JOIN categorias_visitas ON contenedores_visitas.id_catv = categorias_visitas.id_catv
        JOIN recibo_compras ON contenedores_visitas.contenedor = recibo_compras.contenedor
        JOIN areas ON visitas.area_per = areas.id_area
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN vehiculos_fotos ON visitas.id_visit = vehiculos_fotos.id_visit
        WHERE visitas.est = 'A'
        GROUP BY visitas.id_visit
    `;

    try {
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);
        const [resultProveedores] = await pool.query(SQL_QUERY_CONTENEDORES);

        // Combinar resultados
        //const visitasActivas = [...resultVisitantes, ...resultTransportistas];

        res.json({
            visitantes: resultVisitantes,
            transportistas: resultTransportistas,
            contenedores: resultProveedores,
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
            paqueterias.id_paq,
            paqueterias.paqueteria,
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
        LEFT JOIN paqueterias ON transportista.empresa  = paqueterias.id_paq
        WHERE transportista.est = 'A'
        GROUP BY 
            transportista.id_transp

            
        `;

        const SQL_QUERY_CONTENEDORES = `
        SELECT 
            contenedores_visitas.id_cont,
            contenedores_visitas.id_catv,
            contenedores_visitas.contenedor,
            contenedores_visitas.clave,
            recibo_compras.id_recibo,
            recibo_compras.contenedor,
            recibo_compras.naviera,
            recibo_compras.arribo as reg_entrada,
            recibo_compras.tipo as tipoCom,
            categorias_visitas.id_catv,
            categorias_visitas.tipo,
            visitas.entrada_h,
            visitas.id_visit,
            visitas.acc_veh,
            visitas.motivo,
            visitas.area_per,
            visitas.llegada, 
            visitas.validar, 
            visitas.clave_visit, 
            visitas.reg_salida,
            areas.id_area,
            areas.area,
            acomp.id_com,
            acomp.nombre_acomp,
            acomp.apellidos_acomp,
            acomp.no_ine_acomp,
            acomp.foto,
            vehiculos_fotos.img1,
            CONCAT(acomp.nombre_acomp, ' ', acomp.apellidos_acomp) AS nombre_com_acomp,
            COUNT(multas_visitas.id_mul) AS total_multas,
            COUNT(visitas.id_visit) AS total_visitas,
            -- Verificar si el transportista tiene acceso
            CASE 
                WHEN multas_visitas.fecha_acceso > CURDATE() THEN 'SIN ACCESO'
                ELSE 'CON ACCESO'
            END AS estado_acceso
        FROM visitas
        JOIN contenedores_visitas ON visitas.id_vit = contenedores_visitas.clave
        JOIN categorias_visitas ON contenedores_visitas.id_catv = categorias_visitas.id_catv
        JOIN recibo_compras ON contenedores_visitas.contenedor = recibo_compras.contenedor
        JOIN areas ON visitas.area_per = areas.id_area
        LEFT JOIN acomp ON visitas.id_vit = acomp.id_vit
        LEFT JOIN vehiculos_fotos ON visitas.id_visit = vehiculos_fotos.id_visit
        LEFT JOIN multas_visitas ON contenedores_visitas.clave = multas_visitas.id_vit
        WHERE visitas.est = 'A'
        GROUP BY visitas.id_visit
    `;

    try {
        // Ejecutar ambas consultas
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);
        const [resultContenedores] = await pool.query(SQL_QUERY_CONTENEDORES);

        // Combinar resultados
        const visitantesAll = [...resultVisitantes, ...resultTransportistas, ...resultContenedores];

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

    const SQL_QUERY_ENTREGA_EVIDENCIAS = `
        SELECT 
            transportista.id_transp, 
            transportista.nombre,
            transportista.clave, 
            transportista.id_catv, 
            CONCAT(transportista.nombre, ' ', transportista.apellidos) AS nombre_completo,
            categorias_visitas.tipo AS categoria
        FROM transportista
        JOIN categorias_visitas ON transportista.id_catv = categorias_visitas.id_catv
        LEFT JOIN multas_visitas ON transportista.clave = multas_visitas.id_vit
        WHERE transportista.id_catv = 12
        GROUP BY transportista.id_transp
    `;

    try {
        const [resultVisitantes] = await pool.query(SQL_QUERY_VISITANTES);
        const [resultTransportistas] = await pool.query(SQL_QUERY_TRANSPORTISTA);
        const [resultTransportistas2] = await pool.query(SQL_QUERY_ENTREGA_EVIDENCIAS);

        res.json({
            visitantes: resultVisitantes,
            transportistas: [...resultTransportistas, ...resultTransportistas2],
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

    let { id_catv, nombre, apellidos, empresa, telefono, no_licencia, no_ine, marca, modelo, placa, anio, seguro, puesto, no_empleado } = req.body;
    const foto = req.file ? req.file.filename : null;
    const registro = new Date();
    const est = 'A';
    const fechaRegistro = new Date(registro);
    const dia = fechaRegistro.getDate().toString().padStart(2, '0');
    const acc_dir = 'S';

    const cleanString = (str) => str.trim().replace(/\s+/g, ' ');
    nombre = cleanString(nombre || '');
    apellidos = cleanString(apellidos || '');
    empresa = cleanString(empresa || '');

    if (!nombre || !apellidos || !id_catv) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const SQL_CHECK_DUPLICATE = `
    SELECT COUNT(*) as count 
    FROM visitantes 
    WHERE nombre = ? AND apellidos = ? AND est = 'A'
    `;

    const SQL_INSERT_VISITA = `
    INSERT INTO visitantes (id_catv, nombre, apellidos, empresa, telefono, foto, no_licencia, no_ine, puesto, no_empleado, registro, est)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const SQL_UPDATE_CLAVE = `UPDATE visitantes SET clave = ? WHERE id_vit = ?`;

    const SQL_INSERT_VEHICULO = `
    INSERT INTO vehiculos (clave_con, empresa, marca, modelo, placa, anio, seguro, registro, est)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const SQL_INSERT_VEHICULO_PAQUETERIA = `
    INSERT INTO vehiculos (clave_con, empresa, marca, modelo, placa, anio, seguro, acc_dir, registro, est)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const generarClavePersonalizada = (id_catv, dia, id_persona) => {
        const prefijo = id_catv === 4 ? 'PR' : id_catv === 6 ? 'MN' : 'VT';
        return `${prefijo}${dia}${id_persona}`;
    };

    try {
        // Verificar duplicados
        const [duplicateCheck] = await pool.query(SQL_CHECK_DUPLICATE, [nombre, apellidos]);
        if (duplicateCheck[0].count > 0) {
            return res.status(400).json({ message: 'Este visitante ya está registrado.' });
        }

        // Insertar visitante
        const [insertResult] = await pool.query(SQL_INSERT_VISITA, [
            id_catv, nombre, apellidos, empresa, telefono, foto, no_licencia, no_ine, puesto, no_empleado, registro, est,
        ]);

        const id_persona = insertResult.insertId;
        const clavePersonalizada = generarClavePersonalizada(id_catv, dia, id_persona);

        await pool.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);

        if (no_licencia) {
            const vehiculoQuery = id_catv === 7 || id_catv === 10 ? SQL_INSERT_VEHICULO_PAQUETERIA : SQL_INSERT_VEHICULO;
            await pool.query(vehiculoQuery, [
                clavePersonalizada, empresa, marca, modelo, placa, anio, seguro, acc_dir, registro, est,
            ]);
        }

        res.json({ tipo: id_catv === 4 ? 'PR' : id_catv === 6 ? 'MN' : 'VT', message: `${clavePersonalizada}` });
    } catch (error) {
        if (foto) {
            try {
                fs.unlinkSync(path.join('C:/acc-ced', foto));
            } catch (err) {
                console.error("Error al eliminar el archivo:", err);
            }
        }

        console.error('Error al registrar visitante:', error);
        res.status(500).json({ message: 'Error al registrar', error: error.message });
    }
};

const updateVisitante = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { clave } = req.body;
    const foto = req.file ? req.file.filename : null;

    let tabla = null;
    if (clave.startsWith('VT') || clave.startsWith('PR') || clave.startsWith('CL') ) {
        tabla = 'visitantes';
    } else if (clave.startsWith('TR') || clave.startsWith('PQ') || clave.startsWith('VPR') || clave.startsWith('CR')) {
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
    } else if (clave.startsWith('TR') || clave.startsWith('MN') || clave.startsWith('VPR') ||  clave.startsWith('CR') ||  clave.startsWith('PQ')) {
        tabla = 'transportista';
    }

    if (!tabla) {
        return res.status(400).json({ error: 'Prefijo de clave no válido. Debe comenzar con VT, PR, VPR, TR, CR, PQ o MN.' });
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
        SET clave_con = NULL, acc_dir = NULL
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

const getAreasTransp = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM areas WHERE id_area IN (4, 5)`;
    try {
        const [catv] = await pool.query(SQL_QUERY);
        res.json(catv);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las areas.'})
    }
}

const createEmpleado = async (req, res) => {
    try {
        const { id_catv, nombre, apellidos, no_empleado, no_ine, telefono, puesto, tel_emergencia, nom_emergencia, parentesco_contacto, calle, colonia, delegacion, estado } = req.body;

        const foto = req.file ? req.file.filename : null;
        const registro = new Date();
        const est = 'A';
        const dia = String(registro.getDate()).padStart(2, '0');

        const cleanString = (str) => str.trim().replace(/\s+/g, ' ');

        const empleadoNombre = cleanString(nombre);
        const empleadoApellidos = cleanString(apellidos);
        const empleadoNoEmpleado = cleanString(no_empleado);
        const empleadoNoIne = cleanString(no_ine);
        const empleadoTelefono = cleanString(telefono); 
        const empleadoPuesto = cleanString(puesto);
        const empleadoTelEmergencia = cleanString(tel_emergencia);
        const empleadoNomEmergencia = cleanString(nom_emergencia);
        const empleadoParentesco = cleanString(parentesco_contacto);
        const empleadoCalle = cleanString(calle);
        const empleadoColonia = cleanString(colonia);
        const empleadoDelegacion = cleanString(delegacion);
        const empleadoEstado = cleanString(estado);
       

        const SQL_CHECK_EXISTENCE = `
            SELECT COUNT(*) AS count 
            FROM empleados 
            WHERE nombre = ? AND apellidos = ? AND est = 'A'
        `;
        const SQL_INSERT_EMPLEADO = `
            INSERT INTO empleados (id_catv, nombre, apellidos, foto, no_empleado, no_ine, telefono, puesto, registro, est, tel_emergencia, nom_emergencia, parentesco_contacto)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)
        `;
        const SQL_UPDATE_CLAVE = `
            UPDATE empleados 
            SET clave = ? 
            WHERE id_emp = ?
        `;

        const SQL_INSERT_DIRECCION = `
            INSERT INTO direcciones_empleados (calle, colonia, delegacion, estado)
            VALUES(?, ?, ?, ?)
        `;

        const SQL_UPDATE_ID_DIRECCION = `
            UPDATE direcciones_empleados
            SET id_emp = ? 
            WHERE id_dir = ?
        `;

        // Verificar si el empleado ya existe
        const [checkResult] = await pool.query(SQL_CHECK_EXISTENCE, [empleadoNombre, empleadoApellidos]);
        if (checkResult[0].count > 0) {
            return res.status(400).json({ message: 'Este empleado ya está registrado.' });
        }

        // Insertar empleado
        const [insertResult] = await pool.query(SQL_INSERT_EMPLEADO, [
            id_catv, empleadoNombre, empleadoApellidos, foto, empleadoNoEmpleado,
            empleadoNoIne, empleadoTelefono, empleadoPuesto, registro, est, empleadoTelEmergencia, empleadoNomEmergencia, empleadoParentesco
        ]);

        const idPersona = insertResult.insertId;
        const clavePersonalizada = `EC${dia}${idPersona}`;

        // Actualizar clave del empleado
        await pool.query(SQL_UPDATE_CLAVE, [clavePersonalizada, idPersona]);

        // Insertar dirección y obtener el id_dir
        const [insertDirResult] = await pool.query(SQL_INSERT_DIRECCION, [empleadoCalle, empleadoColonia, empleadoDelegacion, empleadoEstado]);
        const idDireccion = insertDirResult.insertId;

        // Actualizar dirección con el id_emp del empleado
        await pool.query(SQL_UPDATE_ID_DIRECCION, [idPersona, idDireccion]);

        res.json({
            message: 'Empleado y dirección registrados exitosamente',
            clave: clavePersonalizada,
            empleadoId: idPersona,
            direccionId: idDireccion
        });
    } catch (error) {
        if (req.file) {
            try {
                fs.unlinkSync(path.join('C:/acc-ced', req.file.filename));
            } catch (err) {
                console.error("Error al eliminar el archivo:", err);
            }
        }

        console.error('Error al registrar empleado:', error);
        res.status(500).json({ message: 'Error al registrar', error: error.message });
    }
};

const updateEmpleado = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);

    const { id_emp, nombre, apellidos, no_empleado, no_ine, telefono, puesto, tel_emergencia, nom_emergencia, parentesco_contacto, 
        calle, colonia, delegacion, estado } = req.body;

    const fotonew = req.file ? req.file.filename : null;

    // Función para limpiar espacios extra entre palabras
    const cleanString = (str) => str ? str.trim().replace(/\s+/g, ' ') : null;

    // Limpiar los datos
    const nombreLimpio = cleanString(nombre);
    const apellidosLimpios = cleanString(apellidos);
    const noEmpleadoLimpio = cleanString(no_empleado);
    const noIneLimpio = cleanString(no_ine);
    const telefonoLimpio = cleanString(telefono);
    const puestoLimpio = cleanString(puesto);
    const telLimpio = cleanString(tel_emergencia);
    const nomTelLimpio = cleanString(nom_emergencia);
    const parentescoLimpio = cleanString(parentesco_contacto);
    const calleLimpio = cleanString(calle);
    const coloniaLimpio = cleanString(colonia);
    const delegacionLimpio = cleanString(delegacion);
    const estadoLimpio = cleanString(estado);

    // Consultas SQL
    const SQL_UPDATE_EMPLEADO = `UPDATE empleados SET nombre = ?, apellidos = ?, no_empleado = ?, no_ine = ?, telefono = ?, puesto = ?, tel_emergencia = ?, nom_emergencia = ?, parentesco_contacto = ? WHERE id_emp = ?`;
    const SQL_GET_DIRECCION = `SELECT id_dir FROM direcciones_empleados WHERE id_emp = ?`;
    const SQL_UPDATE_DIRECCION = `UPDATE direcciones_empleados SET calle = ?, colonia = ?, delegacion = ?, estado = ? WHERE id_dir = ?`;
    const SQL_INSERT_DIRECCION = `INSERT INTO direcciones_empleados (calle, colonia, delegacion, estado, id_emp) VALUES (?, ?, ?, ?, ?)`;
    const SQL_GET_FOTO_ACTUAL = `SELECT foto FROM empleados WHERE id_emp = ?`;
    const SQL_UPDATE_INFORMACION_FOTO = `UPDATE empleados SET foto = ? WHERE id_emp = ?`;

    try {
        await pool.query(SQL_UPDATE_EMPLEADO, [
            nombreLimpio, apellidosLimpios, noEmpleadoLimpio, noIneLimpio, telefonoLimpio, puestoLimpio,
            telLimpio, nomTelLimpio, parentescoLimpio, id_emp
        ]);

        if (fotonew) {
            const [rows] = await pool.query(SQL_GET_FOTO_ACTUAL, [id_emp]);
            if (rows.length > 0 && rows[0].foto) {
                const fotoActual = rows[0].foto;
                fs.unlink(path.join('C:/acc-ced', fotoActual), (err) => {
                    if (err) console.error("Error al eliminar el archivo:", err);
                });
            }

            await pool.query(SQL_UPDATE_INFORMACION_FOTO, [fotonew, id_emp]);
        }

        const [existingDireccion] = await pool.query(SQL_GET_DIRECCION, [id_emp]);

        if (existingDireccion.length > 0) {
            await pool.query(SQL_UPDATE_DIRECCION, [
                calleLimpio, coloniaLimpio, delegacionLimpio, estadoLimpio, existingDireccion[0].id_dir
            ]);
        } else {
            await pool.query(SQL_INSERT_DIRECCION, [
                calleLimpio, coloniaLimpio, delegacionLimpio, estadoLimpio, id_emp
            ]);
        }

        res.status(200).json({
            message: 'Empleado y dirección actualizados exitosamente',
            empleado: {
                id_emp,
                nombre: nombreLimpio,
                apellidos: apellidosLimpios,
                foto: fotonew,
                no_empleado: noEmpleadoLimpio,
                no_ine: noIneLimpio,
                telefono: telefonoLimpio,
                puesto: puestoLimpio
            },
            direccion: {
                calle: calleLimpio,
                colonia: coloniaLimpio,
                delegacion: delegacionLimpio,
                estado: estadoLimpio
            }
        });

    } catch (error) {
        
        if (fotonew) {
            fs.unlink(path.join('C:/acc-ced', fotonew), (err) => {
                if (err) console.error("Error al eliminar la foto:", err);
            });
        }

        console.error('Error al actualizar el empleado:', error);
        res.status(500).json({
            message: 'Error al actualizar el empleado',
            error: error.message
        });
    }
};

const desactivarEmpleado = async (req, res) => {
    const { id_emp } = req.params;
    const { est } = req.body;

    const SQL_UPDATE_EMPLEADO = `UPDATE empleados SET est = ? WHERE id_emp = ?`;

    res.status(201).json({message: 'Empleado cancelado correctamente.'});

    try {
        await pool.query(SQL_UPDATE_EMPLEADO, [est, id_emp]);
    } catch (error) {
        console.error('Error al cancelar empleado:', error);
    }
}

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
    empleados.tel_emergencia,
    empleados.nom_emergencia,

    empleados.parentesco_contacto,
    direcciones_empleados.calle,
    direcciones_empleados.colonia,
    direcciones_empleados.delegacion,
    direcciones_empleados.estado,
    categorias_visitas.id_catv,
    categorias_visitas.tipo,
    CONCAT(empleados.nombre, ' ', empleados.apellidos) AS nombre_completo
     FROM empleados
     JOIN categorias_visitas ON empleados.id_catv = categorias_visitas.id_catv
     LEFT JOIN direcciones_empleados ON empleados.id_emp = direcciones_empleados.id_emp
     WHERE empleados.est IN ('A', 'C')
    ORDER BY 
        CASE WHEN empleados.est = 'C' THEN 1 ELSE 0 END`;
    try {
        const [rest] = await pool.query(SQL_QUERY);
        res.json({empleados: rest});
    } catch (error) {
        res.status(500).json({message: 'Error al obtener empleados.'})
    }
}

const createEmpleadoExcel = async (req, res) => {
    const empleados = req.body;

    const SQL_INSERT_EMPLEADO = `
        INSERT INTO empleados (id_catv, nombre, apellidos, no_empleado, no_ine, telefono, puesto,  tel_emergencia, nom_emergencia, parentesco_contacto, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE = `UPDATE empleados SET clave = ? WHERE id_emp = ?`;

    const SQL_INSERT_DIRECCION = `
        INSERT INTO direcciones_empleados (calle, colonia, delegacion, estado)
        VALUES(?, ?, ?, ?)
    `;
    const SQL_UPDATE_ID_DIRECCION = `
        UPDATE direcciones_empleados SET id_emp = ? WHERE id_dir = ?
    `;

    const cleanText = (text) => {
        if (typeof text === 'string') {
            return text.trim().replace(/\s+/g, ' ').toUpperCase();
        }
        return text != null ? String(text).trim().replace(/\s+/g, ' ').toUpperCase() : null;
    };

    try {
        for (const item of empleados) {
            const id_catv = 8;
            const nombre = cleanText(item.nombre);
            const apellidos = cleanText(item.apellidos);
            const no_empleado = cleanText(item.no_empleado);
            const no_ine = cleanText(item.no_ine);
            const telefono = cleanText(item.telefono);
            const puesto = cleanText(item.puesto);
            const tel_emergencia = cleanText(item.tel_emergencia);
            const nom_emergencia = cleanText(item.nom_emergencia);
            const parentesco_contacto = cleanText(item.parentesco_contacto);

            const calle = cleanText(item.calle);
            const colonia = cleanText(item.colonia);
            const delegacion = cleanText(item.delegacion);
            const estado = cleanText(item.estado);

            const registro = new Date();
            const est = 'A';

            const [result] = await pool.query(SQL_INSERT_EMPLEADO, [
                id_catv, nombre, apellidos, no_empleado, no_ine, telefono, puesto,  tel_emergencia, nom_emergencia, parentesco_contacto, registro, est
            ]);
            const id_persona = result.insertId;

            const clavePersonalizada = `EC${new Date().getDate().toString().padStart(2, '0')}${id_persona}`;
            await pool.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);

            const [dirResult] = await pool.query(SQL_INSERT_DIRECCION, [calle, colonia, delegacion, estado]);
            const id_direccion = dirResult.insertId;

            await pool.query(SQL_UPDATE_ID_DIRECCION, [id_persona, id_direccion]);
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
// const createMulta = async (req, res) => {
//     console.log('Cuerpo de la solicitud:', req.body);
//     const { id_vit, id_usu_mul, id_multa } = req.body;
//     const fecha_multa = new Date();

//     // Consultas SQL
//     const SQL_CHECK_MULTA = `SELECT 1 FROM multas_visitas WHERE id_vit = ?`;
//     const SQL_CHECK_TOTAL_MULTA = `
//         SELECT visitantes.clave, COUNT(multas_visitas.id_vit) AS total_multas 
//         FROM visitantes 
//         LEFT JOIN multas_visitas ON visitantes.clave = multas_visitas.id_vit 
//         WHERE visitantes.clave = ?
//         GROUP BY visitantes.clave
//     `;
//     const SQL_CHECK_TOTAL_MULTA_2 = `
//         SELECT transportista.clave, COUNT(multas_visitas.id_vit) AS total_multas 
//         FROM transportista 
//         LEFT JOIN multas_visitas ON transportista.clave = multas_visitas.id_vit 
//         WHERE transportista.clave = ?
//         GROUP BY transportista.clave
//     `;
//     const SQL_INSERT_MULTA = `
//         INSERT INTO multas_visitas (id_vit, id_usu_mul, id_multa, fecha_multa) 
//         VALUES (?, ?, ?, ?)
//     `;

//     try {
//         await pool.query(SQL_CHECK_MULTA, [id_vit]);

//         let totalMultas = 0;

//         const [checkTotalMulta] = await pool.query(SQL_CHECK_TOTAL_MULTA, [id_vit]);
//         if (checkTotalMulta.length > 0) {
//             totalMultas = checkTotalMulta[0].total_multas;
//         } else {
//             const [checkTotalMulta2] = await pool.query(SQL_CHECK_TOTAL_MULTA_2, [id_vit]);
//             if (checkTotalMulta2.length > 0) {
//                 totalMultas = checkTotalMulta2[0].total_multas;
//             }
//         }

//         if (totalMultas >= 3) {
//             await pool.query(SQL_INSERT_MULTA, [id_vit, id_usu_mul, id_multa, fecha_multa]);
//             return res.json({
//                 success: true,
//                 message: 'Este visitante ha excedido el límite de multas permitidas.',
//             });
//         }

//         // Si existe en `multas_visitas`, no se agrega, solo devuelve mensaje
//         // if (checkMulta.length > 0) {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: 'El visitante/transportista ya tiene multas registradas.',
//         //     });
//         // }

//         // Registrar nueva multa
//         await pool.query(SQL_INSERT_MULTA, [id_vit, id_usu_mul, id_multa, fecha_multa]);

//         return res.json({
//             success: true,
//             message: 'Multa registrada correctamente.',
//         });
//     } catch (error) {
//         console.error('Error al realizar la multa:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Error al aplicar multa',
//             error: error.message,
//         });
//     }
// };

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
        visitantes.clave,
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
        transportista.clave,
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
    
    // INSERT INTO multas_visitas (id_vit, id_usu_mul, id_multa, fecha_multa, fecha_acceso, dup)
    const SQL_INSERT_MULTA = `
        INSERT INTO multas_visitas (id_vit, id_usu_mul, id_multa, fecha_multa) 
        VALUES (?, ?, ?, ?)
    `;

    try {
        // Obtener las sanciones asociadas al id_multa
        // const [sanciones] = await pool.query(SQL_GET_SANCION, [id_multa]);
        // if (sanciones.length === 0) {
        //     return res.status(404).json({
        //         success: false,
        //         message: 'No se encontró la sanción correspondiente para el ID proporcionado.',
        //     });
        // }

        // const [acciones] = await pool.query(SQL_GET_ACCION, [id_multa]);
        // if (acciones.length === 0) {
        //     return res.status(404).json({
        //         success: false,
        //         message: 'No se encontraron las acciones correspondientes para el ID proporcionado.',
        //     });
        // }

        const [conteoMultas] = await pool.query(SQL_GET_MULTAS_EXISTENTES, [id_vit, id_multa]);
        const totalMultas = conteoMultas[0].total_multas;

        let accion = '';
        let diasRestriccion = 0;
        let dup = null;

        // Determinar los días de restricción y la acción según el conteo de multas
        
        // if (totalMultas > 3) {
        //     diasRestriccion = 15;
        //     accion = acciones[0]?.accion_t3 || '';
        //     dup = 1; 
        // } else if (totalMultas >= 3) {
        //     // Si hay 3 o más multas, aplicar la acción_t3 (15 días)
        //     diasRestriccion = 15;
        //     accion = acciones[0]?.accion_t3 || '';
        // } else if (totalMultas === 2) {
        //     // Si hay 2 multas, aplicar la acción_t2 (10 días)
        //     diasRestriccion = 10;
        //     accion = acciones[0]?.accion_t2 || '';
        // } else {
        //     // Si hay menos de 2 multas, aplicar la acción_t1 (5 días)
        //     diasRestriccion = 5;
        //     accion = acciones[0]?.accion_t1 || '';
        // }

        // Calcular la fecha de restricción excluyendo sábados y domingos
        // const calcularFechaRestriccion = (fechaInicio, diasRestriccion) => {
        //     let diasRestantes = diasRestriccion;
        //     let fecha_acceso = new Date(fechaInicio);

        //     while (diasRestantes > 0) {
        //         fecha_acceso.setDate(fecha_acceso.getDate() + 1); // Avanzar un día
        //         const diaSemana = fecha_acceso.getDay();
        //         if (diaSemana !== 0 && diaSemana !== 6) {
        //             diasRestantes--; // Restar un día si es laborable
        //         }
        //     }

        //     return fecha_acceso;
        // };

        // const fecha_acceso = calcularFechaRestriccion(fecha_multa, diasRestriccion);

        await pool.query(SQL_INSERT_MULTA, [id_vit, id_usu_mul, id_multa, fecha_multa]);
        // await pool.query(SQL_INSERT_MULTA, [id_vit, id_usu_mul, id_multa, fecha_multa, fecha_acceso, dup]);
        return res.json({
            success: true,
            message: `Multa registrada correctamente. `,
            // data: {
            //     fecha_acceso,
            //     diasRestriccion,
            //     accion,
            // },
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
    let {id_catv, nombre, apellidos, empresa, telefono, no_licencia, no_ine} = req.body;

    const foto = req.file ? req.file.filename : null;
    const registro = new Date();
    const est = 'A';

    const fechaRegistro = new Date(registro);
    const dia = fechaRegistro.getDate().toString().padStart(2, '0');

    const cleanString = (str) => str.trim().replace(/\s+/g, ' ');

    const cleanNombre = cleanString(nombre);
    const cleanApellidos = cleanString(apellidos);
    const cleanEmpresa = cleanString(empresa);
    const cleanTelefono = cleanString(telefono);
    const cleanLicencia = cleanString(no_licencia);
    const cleanINE = cleanString(no_ine);

    if (!nombre || !apellidos || !id_catv) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const SQL_FIND_DUPLICATE_TRANSPORTISTA = `
        SELECT id_transp FROM transportista 
        WHERE nombre = ? AND apellidos = ? AND est = 'A'
    `;
    const SQL_FIND_DUPLICATE_VISITANTE = `
        SELECT id_visitante FROM visitantes 
        WHERE nombre = ? AND apellidos = ? AND est = 'A'
    `;
    const SQL_INSERT_TRANSPORTISTA = `
        INSERT INTO transportista (id_catv, nombre, apellidos, empresa, telefono, foto, no_licencia, no_ine, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_INSERT_VISITANTE = `
        INSERT INTO visitantes (id_catv, nombre, apellidos, empresa, telefono, foto, no_ine, registro, est)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE = `UPDATE transportista SET clave = ? WHERE id_transp = ?`;

    const deleteFile = (filePath) => {
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error al eliminar el archivo:", err);
        });
    };

    try {
        // if (id_catv === 11 || id_catv === 12 || id_catv === '12' || id_catv === '11') {
        //     // Validar duplicados en la tabla visitantes
        //     const [existingVisitante] = await pool.query(SQL_FIND_DUPLICATE_VISITANTE, [cleanNombre, cleanApellidos]);

        //     if (existingVisitante.length > 0) {
        //         return res.status(400).json({ message: "Ya existe un visitante con el mismo nombre y apellidos." });
        //     }

        //     // Insertar en la tabla visitantes
        //     await pool.query(SQL_INSERT_VISITANTE, [ id_catv, cleanNombre, cleanApellidos, cleanEmpresa, cleanTelefono, foto, cleanINE, registro, est,]);

        //     return res.json({
        //         tipo: "VT",
        //         message: "Visitante registrado correctamente",
        //     });
        // }

        // Verificar duplicados en transportista
        const [existingTransportista] = await pool.query(SQL_FIND_DUPLICATE_TRANSPORTISTA, [cleanNombre, cleanApellidos]);

        if (existingTransportista.length > 0) {
            return res.status(400).json({ message: "Ya existe un transportista con el mismo nombre y apellidos." });
        }

        const prefijoClave = id_catv === 6 ? 'MN' : 'TR';

        const [insertResult] = await pool.query(SQL_INSERT_TRANSPORTISTA, [
            id_catv, cleanNombre, cleanApellidos, cleanEmpresa, cleanTelefono,
            foto, cleanLicencia, cleanINE, registro, est,
        ]);

        const id_persona = insertResult.insertId;
        const clavePersonalizada = `${prefijoClave}${dia}${id_persona}`;

        await pool.query(SQL_UPDATE_CLAVE, [clavePersonalizada, id_persona]);

        res.json({
            tipo: prefijoClave,
            message: clavePersonalizada,
        });
    } catch (error) {
        if (foto) deleteFile(path.join('C:/acc-ced', foto));
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

    if (isNaN(anio) || anio < 1900 || anio > new Date().getFullYear()) {
        return res.status(400).json({
            message: 'El campo "anio" debe ser un número válido entre 1900 y el año actual',
        });
    }

    // Función para limpiar espacios extra entre palabras
    const cleanString = (str) => str.trim().replace(/\s+/g, ' ');

    // Limpiar los datos
    const empresav = cleanString(empresa);
    const marcav = cleanString(marca);
    const modelov = cleanString(modelo);
    const placav = cleanString(placa);
    const segurov = cleanString(seguro);
    const aniov = parseInt(anio, 10); // Convertir "anio" a número entero
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
            empresav, marcav, modelov, placav, aniov, segurov, registro, est,
        ]);

        // Respuesta de éxito
        res.status(201).json({
            message: 'Vehículo registrado exitosamente',
            vehiculo: {
                empresa: empresav,
                marca: marcav,
                modelo: modelov,
                placa: placav,
                anio: aniov,
                seguro: segurov,
                registro,
                est,
            },
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

            const [result] = await conexion.query(SQL_INSERT_VEHICULO, [
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
const getCategoriasMT = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM categorias_visitas WHERE id_catv = 5 OR id_catv = 6 OR id_catv = 11 OR id_catv = 12 AND id_catv != 13`;
    try {
        const [catv] = await pool.query(SQL_QUERY);
        res.json(catv);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las categorias.'})
    }
}

//lista de tipos de invitados
const getCategorias = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM categorias_visitas WHERE id_catv != 4 AND id_catv != 5 AND id_catv != 6 AND id_catv != 8 AND id_catv != 7 AND id_catv != 11 AND id_catv != 12 `;
    try {
        const [catv] = await pool.query(SQL_QUERY);
        res.json(catv);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las categorias.'})
    }
}
const getCategoriasPP = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM categorias_visitas WHERE id_catv IN (4, 7) AND id_catv != 13`;
    try {
        const [catv] = await pool.query(SQL_QUERY);
        res.json(catv);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las categorias.'})
    }
}

const getCortinas = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM cortinas`;
    try {
        const [cor] = await pool.query(SQL_QUERY);
        res.json(cor);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las cortinas.'})
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

const getPaqueterias = async (req, res) => {
    const SQL_QUERY = `SELECT * FROM paqueterias`;
    try {
        const [paq] = await pool.query(SQL_QUERY);
        res.json(paq);
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
//#region visitas proveedores
const createVisitaProveedor1 = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { reg_entrada, hora_entrada, id_vit, motivo, area_per, personal, acompanantes, access, id_veh, motivo_acc } = req.body;

    const cleanString = (str) => (str ? str.trim().replace(/\s+/g, ' ') : '');

    const cleanedMotivo = cleanString(motivo);
    const cleanedPersonal = cleanString(personal);
    const cleanedMotivoAcc = cleanString(motivo_acc);

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
        INSERT INTO acomp (nombre_acomp, apellidos_acomp, no_ine_acomp, id_vit, id_visit, clave_visit) 
        VALUES ?
    `;
    const SQL_INSERT_ACCESO_VEHICULO = `
        INSERT INTO vehiculo_per (id_visit, id_vit, id_veh, motivo_acc) 
        VALUES (?, ?, ?, ?)
    `;
    const SQL_UPDATE_CLAVE_VISITA = `
        UPDATE visitas SET clave_visit = ? WHERE id_vit = ?
    `;
    const SQL_UPDATE_CLAVE_ACCESO = `
        UPDATE visitas SET acc_veh = ? WHERE id_vit = ?
    `;

    try {
        const [checkResult] = await pool.query(SQL_CHECK_VISIT, [id_vit, reg_entrada]);
        if (checkResult.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Este invitado ya tiene una visita registrada para la fecha indicada.',
            });
        }

        const [insertResult] = await pool.query(SQL_INSERT_VISIT, [
            id_vit, reg_entrada, hora_entrada, cleanedMotivo, area_per, cleanedPersonal,
        ]);
        const visitaId = insertResult.insertId;

        const prefix = id_vit.startsWith('TR') ? 'TR' : id_vit.startsWith('VT') ? 'VT' : 'GEN';
        const random = Math.floor(1000 + Math.random() * 900).toString();
        const claveVisita = `${prefix}${random}${visitaId}`;

        await pool.query(SQL_UPDATE_CLAVE_VISITA, [claveVisita, id_vit]);

        if (access === 1) {
            await pool.query(SQL_INSERT_ACCESO_VEHICULO, [visitaId, id_vit, id_veh, cleanedMotivoAcc]);
        }

        if (acompanantes && acompanantes.length > 0) {
            const values = acompanantes.map(acomp => [
                acomp.nombre_acomp, acomp.apellidos_acomp, acomp.no_ine_acomp, id_vit, visitaId, claveVisita
            ]);
            await pool.query(SQL_INSERT_ACOMPANANTES, [values]);

            return res.json({
                success: true,
                message: 'Visita y acompañantes registrados correctamente.',
                data: { id_vit, reg_entrada, hora_entrada, motivo: cleanedMotivo, area_per, personal, acompanantes, claveVisita },
            });
        }

        if (['TR', 'PR'].includes(prefix)) {
            await pool.query(SQL_UPDATE_CLAVE_ACCESO, ['S', id_vit]);
        }

        return res.json({
            success: true,
            message: 'Visita registrada correctamente sin acompañantes.',
            data: { id_vit, reg_entrada, hora_entrada, motivo: cleanedMotivo, area_per, personal, claveVisita },
        });

    } catch (error) {
        console.error('Error en la operación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor al registrar la visita.',
        });
    }
};
//#enregion

module.exports = { createVisita, pasarValidar, pasarLlegada, darAccesoVisitante, registrarAcompañantes, getVisitas, getVisitasVehiculoValidado, getVisitasAct, getVisitasReporte, getVisitantes,getVisitanteId,
    createVisitante, getTransportistas, createTransportista, getCategorias, updateVisitante, createTransportistaExcel, darSalidaVisitante,  getCategoriasPP,
    getAllPermisos, permisosAutos, createMulta, multas, getMultaDetails, getMultaDetail, visitantesAll, getCategoriasMT, getAllVehiculos, createVehiculosExcel, updateInfoVisitantes,
    updateClave, getConceptosMultas, getProveedores, createVisitaProveedor, actividadVigilancia, getActividadVigilancia, updateInfoVisitantesVehiculo,
    validacionVehiculo, validacionProveedor, pagarMulta, createEmpleado, updateEmpleado, desactivarEmpleado, getAreas, getAreasTransp, getEmpleados,createEmpleadoExcel, createVehiculo,
    getPaqueterias, getCortinas, createVisitaPaqueteria, cancelarVisita, getVisitasHoy, updatePaqueteria, upload, uploadImgVehiculo,uploadImgPagos, }