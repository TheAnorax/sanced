const Actualizar = require('../modelaplication/actualizarModel.js');

const actualizarBahias = async (req, res) => {
    try {
        const bodyB = req.body;
        const actubahia = new Actualizar(bodyB);
        const respuesta = await actubahia.actualizarBahia();
        res.json(respuesta);
    } catch (error) {
        res.json({ message: error.message});
    }
};

const actualizarProductos = async (req,res) => {
    try {
        const bodyP = req.body;
        const actuprod = new Actualizar(bodyP);
        const respuesta = await actuprod.actualizarProductos();
        res.json(respuesta);
    } catch (error) {
        res.json({message : error.message});
    }
};

const actualizarEmbarques = async (req, res) => {
    try {
        const bodyE = req.body;
        const actuembarque = new Actualizar(bodyE);
        const respuesta = await actuembarque.actualizarEmbarque();
        console.log('respusta controller: ', respuesta);
        res.json(respuesta);
    } catch (error) {
        res.json({message : error.message});
    }
};

const actualizarNoSurtidos = async (req, res) => {
    try {
        const bodyNS = req.body;
        const actunosur = new Actualizar(bodyNS);
        const respuesta = await actunosur.actualizarNoSurtido();
        res.json(respuesta);
    } catch (error) {
        res.json({message : error.message})
    }
};

const actualizarEstados = async (req,res) => {
    try {
        const bodyEst = req.body;
        const actuestado = new Actualizar(bodyEst);
        const respuesta = await actuestado.actualizarEstado();
        res.json(respuesta);
    } catch (error) {
        res.json({message : error.message});
    }
};

const actualizarReabastecimiento = async (req, res) => {
    try {
        res.json(await new Actualizar.actualizarReabasto());
    } catch (error) {
        res.json({ message : error.message });
    }
};

module.exports = {
    actualizarBahias,
    actualizarProductos,
    actualizarEmbarques,
    actualizarNoSurtidos,
    actualizarEstados,
    actualizarReabastecimiento,
};