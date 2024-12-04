const pool = require('../config/database');

const Ubicaciones = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM concentrado GROUP BY UBICACIÓN');

        // Estructura de datos agrupada
        const pasillos = {};

        // Agrupación de datos
        rows.forEach(row => {
            // Extraer el pasillo, sección y nivel de la ubicación
            const pasilloKey = row.UBICACIÓN.slice(0, 3); // P02
            const numeroPasillo = parseInt(row.UBICACIÓN.slice(1, 3), 10); // 02
            const seccion = row.UBICACIÓN.slice(4, 7); // 001
            const numeroSeccion = parseInt(seccion, 10); // 1, 2, 3, etc.
            const nivel = row.UBICACIÓN.slice(8); // 1A

            if (!pasillos[pasilloKey]) {
                pasillos[pasilloKey] = {}; 
            }

            if (!pasillos[pasilloKey][`Sección ${seccion}`]) {
                pasillos[pasilloKey][`Sección ${seccion}`] = {
                    Pares: [],
                    Impares: []
                };
            }

            // Agrupar por pares e impares dentro de la sección
            if (row.TIPO === 'PAR' && numeroSeccion % 2 === 0) {
                pasillos[pasilloKey][`Sección ${seccion}`].Pares.push({ ...row, NIVEL: nivel });
            } else if (row.TIPO === 'IMPAR') {
                pasillos[pasilloKey][`Sección ${seccion}`].Impares.push({ ...row, NIVEL: nivel });
            }
        });

        // Ordenar y agrupar las secciones pares e impares de dos en dos
        const sortedPasillos = Object.keys(pasillos)
            .sort((a, b) => {
                const numA = parseInt(a.slice(1), 10);
                const numB = parseInt(b.slice(1), 10);
                return numA - numB;
            })
            .reduce((result, key) => {
                result[key] = {};

                // Obtener las secciones pares
                const seccionesPares = Object.keys(pasillos[key])
                    .filter(sectionKey => parseInt(sectionKey.split(' ')[1], 10) % 2 === 0)
                    .sort((a, b) => {
                        const numA = parseInt(a.split(' ')[1], 10);
                        const numB = parseInt(b.split(' ')[1], 10);
                        return numA - numB;
                    })
                    .reverse(); // Invertir el orden para que sea descendente

                // Obtener las secciones impares
                const seccionesImpares = Object.keys(pasillos[key])
                    .filter(sectionKey => parseInt(sectionKey.split(' ')[1], 10) % 2 !== 0)
                    .sort((a, b) => {
                        const numA = parseInt(a.split(' ')[1], 10);
                        const numB = parseInt(b.split(' ')[1], 10);
                        return numA - numB;
                    });

                // Agrupar las secciones pares de dos en dos (en orden descendente)
                for (let i = 0; i < seccionesPares.length; i += 2) {
                    const seccion1 = seccionesPares[i];
                    const seccion2 = seccionesPares[i + 1];

                    if (seccion2) {
                        result[key][`${seccion1} y ${seccion2}`] = {
                            Pares: [
                                { seccion: seccion1, ubicaciones: pasillos[key][seccion1].Pares },
                                { seccion: seccion2, ubicaciones: pasillos[key][seccion2].Pares }
                            ],
                            Impares: []
                        };
                    } else {
                        result[key][seccion1] = pasillos[key][seccion1];
                    }
                }

                // Agrupar las secciones impares de dos en dos
                for (let i = 0; i < seccionesImpares.length; i += 2) {
                    const seccion1 = seccionesImpares[i];
                    const seccion2 = seccionesImpares[i + 1];

                    if (seccion2) {
                        result[key][`${seccion1} y ${seccion2}`] = {
                            Pares: [],
                            Impares: [
                                { seccion: seccion1, ubicaciones: pasillos[key][seccion1].Impares },
                                { seccion: seccion2, ubicaciones: pasillos[key][seccion2].Impares }
                            ]
                        };
                    } else {
                        result[key][seccion1] = pasillos[key][seccion1];
                    }
                }

                return result;
            }, {});

        res.json(sortedPasillos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las ubicaciones', error: error.message });
    }
};

module.exports = { Ubicaciones };
