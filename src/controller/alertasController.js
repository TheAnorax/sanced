const cron = require('node-cron');

let alertasManana = [];
let alertasTarde = [];
let alertasNoche = [];

const generarHorariosAleatorios = async (inicioHora = 7, finHora = 13) => {
  const horarios = new Set();
  while (horarios.size < 3) {
    const hora = Math.floor(Math.random() * (finHora - inicioHora + 1)) + inicioHora;
    const minuto = Math.floor(Math.random() * 60);
    horarios.add(`${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`);
  }
  return Array.from(horarios);
};

const inicializarAlertas = async (io) => {
  //  Generar horarios de prueba al iniciar
  alertasManana = await generarHorariosAleatorios(7, 13);
  alertasTarde = await generarHorariosAleatorios(14, 19);
  alertasNoche = await generarHorariosAleatorios(20, 6);

  console.log(" Horarios iniciales generados:");
  console.log(" Mañana:", alertasManana);
  console.log(" Tarde:", alertasTarde);
  console.log(" Noche:", alertasNoche);

  //  Cron jobs para producción
  cron.schedule('0 7 * * *', async () => {
    alertasManana = await generarHorariosAleatorios(7, 13);
    console.log(' Horarios de la mañana generados:', alertasManana);
  });

  cron.schedule('0 14 * * *', async () => {
    alertasTarde = await generarHorariosAleatorios(14, 19);
    console.log(' Horarios de la tarde generados:', alertasTarde);
  });

  cron.schedule('0 19 * * *', async () => {
    alertasNoche = await generarHorariosAleatorios(14, 19);
    console.log(' Horarios de la noche generados:', alertasNoche);
  });

  cron.schedule('* * * * *', () => {
    const now = new Date();
    const horaActual = now.toTimeString().slice(0, 5);

    if (alertasManana.includes(horaActual)) {
      io.emit('alerta', { mensaje: ` ¡Alerta de la mañana a las ${horaActual}!` });
    }

    if (alertasTarde.includes(horaActual)) {
      io.emit('alerta', { mensaje: ` ¡Alerta de la tarde a las ${horaActual}!` });
    }

    if (alertasNoche.includes(horaActual)) {
      io.emit('alerta', { mensaje: ` ¡Alerta de la noche a las ${horaActual}!` });
    }
  });
};

const obtenerHorarios = (req, res) => {
  res.json({
    manana: alertasManana,
    tarde: alertasTarde,
    noche: alertasNoche
  });
};

module.exports = {
  inicializarAlertas,
  obtenerHorarios
};
