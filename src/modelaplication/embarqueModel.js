const db = require('../config/databaseapp.js');

class EmbarqueModel{
    static async listaReciboCedis() {
        const query = 'CALL sp_getPedidoEmbarqueInfo();';
        return await db.listar(query);
    }
}

module.exports = EmbarqueModel;