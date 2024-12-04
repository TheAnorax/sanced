const EmbarqueModel = require('../modelaplication/embarqueModel.js');

const embarquesLista = async (req, res) => {
    try {
        res.json(await EmbarqueModel.listaReciboCedis());
    }catch(error){
        res.json({message : error.message});
    }
};

module.exports = {embarquesLista};
