const InsumoModel = require('../modelaplication/insumos.js');


const insumoLista = async (req, res) => {
    try {
        res.json(await InsumoModel.listaInsumoCedis());
    } catch (error) {
        res.json({ message: error.message });
    }
};

const reciboInsumo = async (req, res) => {
    try {
        const bodyL = req.body;
        const listarecibo = new InsumoModel(bodyL);
        const guardar = await listarecibo.ObtenerCodigo();
        res.json(guardar);
    } catch (error) {
        res.json({ message: error.message });
    }
};

const newInsumo = async (req, res) => {
    try {
        const bodyL = req.body;
        const listarecibo = new InsumoModel(bodyL);
        const guardar = await listarecibo.newInsumo()
        res.json(guardar);
    } catch (error) {
        res.json({ message: error.message });
    }

};


const updateInsumo = async (req, res) => {
    try {
        const bodyL = req.body;
        const listarecibo = new InsumoModel(bodyL);
        const guardar = await listarecibo.updateInsumo()
        res.json(guardar);  
    } catch (error) {
        res.json({ message: error.message });
    }
}

const modifyInsumo = async (req, res) => {
    try {
        const bodyL = req.body;
        const listarecibo = new InsumoModel(bodyL);
        const guardar = await listarecibo.modifyInsumo()
        res.json(guardar);
    } catch (error) {
        res.json({ message: error.message });
    }
}

const ingresoInsumos = async (req, res) => {
    try {
        const bodyL = req.body;
        const listarecibo = new InsumoModel(bodyL);
        const guardar = await listarecibo.ingresoInsumos()
        res.json(guardar);
    } catch (error) {
        res.json({ message: error.message });
    }
}

const Insumos  = async (req, res) => {
    try {
        res.json(await InsumoModel.Insumosagregados());
    } catch (error) {
        res.json({ message: error.message });
    }
};

const InsumosReducidos  = async (req, res) => {
    try {
        res.json(await InsumoModel.Insumosreducidos());
    } catch (error) {
        res.json({ message: error.message });
    }
};








module.exports = { insumoLista, reciboInsumo, newInsumo, updateInsumo, modifyInsumo, ingresoInsumos, Insumos, InsumosReducidos,  };