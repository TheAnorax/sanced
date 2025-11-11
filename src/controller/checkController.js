const pool = require("../config/database");

const obtenerChecklist = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM checklist_equipos ORDER BY fecha DESC");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener checklist:", error);
        res.status(500).json({ message: "Error al obtener checklist" });
    }
};

const insertarChecklist = async (req, res) => {
    try {
        const data = req.body;

        const query = `
      INSERT INTO checklist_equipos (
        fecha, folio, marca, modelo, serie, tipo_equipo, empresa, supervisor,
        torreta, obs_torreta,
        alarma_reversa, obs_alarma_reversa,
        claxon, obs_claxon,
        extintor, obs_extintor,
        espejos_protector_cristal, obs_espejos_protector_cristal,
        cuartos, obs_cuartos,
        base_cuartos, obs_base_cuartos,
        faro, obs_faro,
        base_faro, obs_base_faro,
        switch_ignicion, obs_switch_ignicion,
        llave_switch, obs_llave_switch,
        tapas_plastico, obs_tapas_plastico,
        perno_arrastre, obs_perno_arrastre,
        calcomanias, obs_calcomanias,
        portahorquillas, obs_portahorquillas,
        horquilla, obs_horquilla,
        respaldo_carga, obs_respaldo_carga,
        parrilla_contrapeso, obs_parrilla_contrapeso,
        desplazador_lateral, obs_desplazador_lateral,
        palanca_control_velocidades, obs_palanca_control_velocidades,
        aditamento, obs_aditamento,
        llantas_delanteras, obs_llantas_delanteras,
        llantas_traseras, obs_llantas_traseras,
        bateria, obs_bateria,
        cargador, obs_cargador,
        valtaje_cargador, obs_valtaje_cargador,
        asiento, obs_asiento,
        protector_operador, obs_protector_operador,
        piso_plataforma, obs_piso_plataforma,
        tapon_aceite, obs_tapon_aceite,
        estado_pintura, obs_estado_pintura,
        altura_mastil, obs_altura_mastil,
        golpes, obs_golpes,
        nota_adicional,
        firma_operador, firma_supervisor
      ) VALUES ?
    `;

        // Preparamos los valores (en un solo array de un registro)
        const values = [[
            data.fecha, data.folio, data.marca, data.modelo, data.serie, data.tipo_equipo,
            data.empresa, data.supervisor,
            data.torreta, data.obs_torreta,
            data.alarma_reversa, data.obs_alarma_reversa,
            data.claxon, data.obs_claxon,
            data.extintor, data.obs_extintor,
            data.espejos_protector_cristal, data.obs_espejos_protector_cristal,
            data.cuartos, data.obs_cuartos,
            data.base_cuartos, data.obs_base_cuartos,
            data.faro, data.obs_faro,
            data.base_faro, data.obs_base_faro,
            data.switch_ignicion, data.obs_switch_ignicion,
            data.llave_switch, data.obs_llave_switch,
            data.tapas_plastico, data.obs_tapas_plastico,
            data.perno_arrastre, data.obs_perno_arrastre,
            data.calcomanias, data.obs_calcomanias,
            data.portahorquillas, data.obs_portahorquillas,
            data.horquilla, data.obs_horquilla,
            data.respaldo_carga, data.obs_respaldo_carga,
            data.parrilla_contrapeso, data.obs_parrilla_contrapeso,
            data.desplazador_lateral, data.obs_desplazador_lateral,
            data.palanca_control_velocidades, data.obs_palanca_control_velocidades,
            data.aditamento, data.obs_aditamento,
            data.llantas_delanteras, data.obs_llantas_delanteras,
            data.llantas_traseras, data.obs_llantas_traseras,
            data.bateria, data.obs_bateria,
            data.cargador, data.obs_cargador,
            data.valtaje_cargador, data.obs_valtaje_cargador,
            data.asiento, data.obs_asiento,
            data.protector_operador, data.obs_protector_operador,
            data.piso_plataforma, data.obs_piso_plataforma,
            data.tapon_aceite, data.obs_tapon_aceite,
            data.estado_pintura, data.obs_estado_pintura,
            data.altura_mastil, data.obs_altura_mastil,
            data.golpes, data.obs_golpes,
            data.nota_adicional,
            data.firma_operador, data.firma_supervisor
        ]];

        await pool.query(query, [values]);

        res.json({ message: "Checklist insertado correctamente" });
    } catch (error) {
        console.error("❌ Error al insertar checklist:", error);
        res.status(500).json({ message: "Error al insertar checklist" });
    }
};


module.exports = { obtenerChecklist, insertarChecklist };