const pool = require('../config/database'); // Ajusta al path correcto

// Obtener inventario desde ubi_alma directamente
const obtenerInventarioUbicaciones = async (req, res) => {
    const query = `
      SELECT 
      u.id_ubi, 
        u.ubi AS ubicacion,
        u.code_prod AS codigo_producto,
        u.cant_stock AS cantidad_stock,
        u.pasillo,
        u.lote,
        u.almacen,
        u.nivel,
        u.ingreso,
        p.des AS descripcion
      FROM ubi_alma u
      LEFT JOIN productos p ON u.code_prod = p.codigo_pro
      WHERE u.code_prod IS NOT NULL
    `;

    try {
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener datos del inventario:', error);
        res.status(500).json({ error: 'Error al obtener los datos del inventario' });
    }
};


// Inertar Ubicacion 
const insertarUbicacion = async (req, res) => {
    const { ubi, code_prod, cant_stock } = req.body;
    if (!ubi || !code_prod || !cant_stock) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const query = `INSERT INTO ubi_alma (ubi, code_prod, cant_stock) VALUES (?, ?, ?)`;

    try {
        await pool.query(query, [ubi, code_prod, cant_stock]);
        res.json({ success: true });
    } catch (error) {
        console.error("Error al insertar ubicación:", error);
        res.status(500).json({ error: "Error al insertar ubicación" });
    }
};

const actualizarUbicacion = async (req, res) => {
    const {
        ubicacion,
        codigo_producto,
        cantidad_stock,
        pasillo = '',
        lote = '',
        almacen = '',
        estado = '',
        adicionales = [] // [{ code_prod, cant_stock }]
    } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Actualizar producto existente
        const queryUpdate = `
            UPDATE ubi_alma 
            SET 
                cant_stock = ?,
                pasillo = IF(? = '', pasillo, ?),
                lote = IF(? = '', lote, ?),
                almacen = IF(? = '', almacen, ?),
                estado = IF(? = '', estado, ?)
            WHERE ubi = ? AND code_prod = ?
        `;

        await connection.query(queryUpdate, [
            cantidad_stock,
            pasillo, pasillo,
            lote, lote,
            almacen, almacen,
            estado, estado,
            ubicacion,
            codigo_producto
        ]);

        // 2. Insertar productos adicionales si estado es "Compartido"
        if (estado === "Compartido" && adicionales.length > 0) {
            const insertQuery = `
                INSERT INTO ubi_alma 
                (ubi, code_prod, cant_stock, pasillo, lote, almacen, estado)
                VALUES ?
            `;

            const values = adicionales.map(prod => [
                ubicacion,
                prod.code_prod,
                prod.cant_stock,
                pasillo || null,
                lote || null,
                almacen || null,
                "Compartido"
            ]);

            await connection.query(insertQuery, [values]);
        }

        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error("Error al actualizar ubicación:", error);
        res.status(500).json({ error: "Error al actualizar ubicación" });
    } finally {
        connection.release();
    }
};

const eliminarUbicacion = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM ubi_alma WHERE id_ubi = ?`;
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Ubicación no encontrada" });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error al eliminar ubicación:", error);
        res.status(500).json({ error: "Error al eliminar la ubicación" });
    }
};


const obtenerTodosLosArribos = async (req, res) => {
    try {
        const tablas = [
            'departamental',
            'maq_externa',
            'cuarentena',
            'exportaciones',
            'segunda',
            'devoluciones',
            'diferencia',
            'muestras'
        ];

        const resultados = {};

        for (const tabla of tablas) {
            const [rows] = await pool.query(`
                SELECT t.*, u.name AS responsable
                FROM ${tabla} t
                LEFT JOIN usuarios u ON t.codigo_salida = u.id_usu
            `);
            resultados[tabla] = rows;
        }

        res.json(resultados);
    } catch (error) {
        console.error("❌ Error al obtener datos de arribos:", error);
        res.status(500).json({ error: "Error al obtener datos de arribos" });
    }
};

// 🆕 Agrega esta función arriba de realizarTraspaso
function obtenerNumeroAlmacen(nombre) {
    const mapa = {
        "inventario": "7050",  // <- Tu inventario principal
        "departamental": "7066",
        "maq_externa": "7237",
        "cuarentena": "7008",
        "exportaciones": "7080",
        "segunda": "7235",
        "devoluciones": "7236",
        "diferencia": "7090",
        "muestras": "7081"
    };
    return mapa[nombre] || "0000"; // fallback en caso de error
}

// 🎯 Función realizarTraspaso ya corregida:
const realizarTraspaso = async (req, res) => {
    const {
        id_ubicacion,
        code_prod,
        cant_stock,
        almacen_entrada,
        almacen_origen_tabla, // 👈 nuevo
        codigo_salida
    } = req.body;


    try {
        const almacenesValidos = [
            "departamental", "maq_externa", "cuarentena",
            "exportaciones", "segunda", "devoluciones",
            "diferencia", "muestras"
        ];

        if (!almacenesValidos.includes(almacen_entrada)) {
            return res.status(400).json({ error: "Almacén destino inválido" });
        }

        // Buscar producto por ubicación + código de producto
        const [rows] = await pool.query(
            `SELECT * FROM ubi_alma WHERE ubi = ? AND code_prod = ?`,
            [id_ubicacion, code_prod]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado en la ubicación especificada" });
        }

        const actual = rows[0];

        if (cant_stock > actual.cant_stock) {
            return res.status(400).json({ error: "La cantidad a mover excede el stock disponible" });
        }

        // Calcular nuevo stock
        const nuevoStock = actual.cant_stock - cant_stock;

        // Actualizar stock restante en ubi_alma
        await pool.query(
            `UPDATE ubi_alma SET cant_stock = ? WHERE ubi = ? AND code_prod = ?`,
            [nuevoStock, id_ubicacion, code_prod]
        );

        // Insertar el movimiento en el almacén de destino
        await pool.query(
            `INSERT INTO ${almacen_entrada}
            (ubi, code_prod, cant_stock, cant_stock_mov, pasillo, lote, almacen_entrada, almacen_salida, fecha_salida, codigo_salida)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [
                actual.ubi,
                code_prod,
                cant_stock,
                cant_stock,
                actual.pasillo || '',
                actual.lote || '',
                obtenerNumeroAlmacen(almacen_entrada), // Número del almacén destino
                obtenerNumeroAlmacen(almacen_salida),  // Número del almacén origen
                codigo_salida
            ]
        );

        return res.json({ success: true });

    } catch (error) {
        console.error("❌ Error en traspaso:", error);
        return res.status(500).json({ error: "Error interno al realizar traspaso" });
    }
};





module.exports = { obtenerInventarioUbicaciones, insertarUbicacion, actualizarUbicacion, eliminarUbicacion, obtenerTodosLosArribos, realizarTraspaso };
