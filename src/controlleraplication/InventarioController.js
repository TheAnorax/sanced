const Inventario_P = require('../modelaplication/InventarioModel.js');



const Obtenerinv = async (req, res) => {
    try {
        const bodyL = req.body;
        const listarecibo = new Inventario_P(bodyL);
        const guardar = await listarecibo.Obtenerinventario();
        res.json(guardar);
    } catch (error) {
        res.json({ message: error.message });
    }
};

const ReduccionInv = async (req, res) => { 
    try {
        const bodyL = req.body;
        const listarecibo = new Inventario_P(bodyL);
        const guardar = await listarecibo.ReducirInventario();
        res.json(guardar);
    } catch (error) {
        res.json({ message: error.message });
    }
};

const redInventario = async (req, res) => {
    try {
        res.json(await Inventario_P.Obtinv());
 
    } catch (error) {
        res.json({ message: error.message });
    }
};

const Obtdatos = async (req, res) => {
    try {
        res.json(await Inventario_P.Obtubi());

    } catch (error) {
        res.json({ message: error.message });
    }
};

const Obtdatosvacios = async (req, res) => {
    try {
        res.json(await Inventario_P.Obtubibacias());

    } catch (error) {
        res.json({ message: error.message });
    }
};

const ObtenerUbi = async (req, res) => {
    try {
        const bodyL = req.body;
        const listarecibo = new Inventario_P(bodyL);
        const guardar = await listarecibo.ObtenerUbica();
        res.json(guardar);
    } catch (error) {
        res.json({ message: error.message });
    }
};

const Updateubi = async (req, res) => {
    try {
        const bodyL = req.body;
        const listarecibo = new Inventario_P(bodyL);
        const guardar = await listarecibo.Actualizarubi();
        res.json(guardar);
    } catch (error) {
        res.json({ message: error.message });
    }
};
//jjjj
const ObtMaq = async (req, res) => {
    try {
        res.json(await Inventario_P.Maq());

    } catch (error) {
        res.json({ message: error.message });
    }
};

const ObtCua = async (req, res) => {
    try {
        res.json(await Inventario_P.Cua());

    } catch (error) {
        res.json({ message: error.message });
    }
};

const ObtExp = async (req, res) => {
    try {
        res.json(await Inventario_P.Exp());

    } catch (error) {
        res.json({ message: error.message });
    }
};


const ObtSeg = async (req, res) => {
    try {
        res.json(await Inventario_P.Seg());

    } catch (error) {
        res.json({ message: error.message });
    }
};

const ObtDev = async (req, res) => {
    try {
        res.json(await Inventario_P.Dev());

    } catch (error) {
        res.json({ message: error.message });
    }
};

const ObtDif = async (req, res) => {
    try {
        res.json(await Inventario_P.Dif());

    } catch (error) {
        res.json({ message: error.message });
    }
};

const ObtMue = async (req, res) => {
    try {
        res.json(await Inventario_P.Mue());

    } catch (error) {
        res.json({ message: error.message });
    }
};
//7888
const BorrarAlm = async (req, res) => {
    try {
        const bodyL = req.body;
        const listarecibo = new Inventario_P(bodyL);
        const guardar = await listarecibo.BorrarDatos();
        res.json(guardar);
    } catch (error) {
        res.json({ message: error.message });
    }
};


const Obtredinv = async (req, res) => {
    try {
        res.json(await Inventario_P.Red());

    } catch (error) {
        res.json({ message: error.message });
    }
};


module.exports = { Obtenerinv, ReduccionInv, redInventario, Obtdatos, Obtdatosvacios, ObtenerUbi, Updateubi, ObtMaq, ObtCua, ObtExp, ObtSeg, ObtDev, ObtDif, ObtMue, BorrarAlm, Obtredinv };

