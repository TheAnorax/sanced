const ReciboCedisTarima = require('../modelaplication/reciboCedisTarimaModel.js');

const tarimaReciboCedis = async (req,res) => {
    try {
        const body = req.body;
        const tarimarecibo = new ReciboCedisTarima(body);
        const res_guardar = await tarimarecibo.tarimacedis();
        res.json(res_guardar);
    }catch(error){
        res.json({message : error.message});
    }
}

module.exports = {tarimaReciboCedis};