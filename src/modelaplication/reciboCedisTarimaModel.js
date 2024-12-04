const db = require('../config/databaseapp.js');

class ReciboCedisTarimaModel {
    constructor(dato){
        this.dato = dato;
    }

    async tarimacedis() {
        const query = `CALL sp_newReciboCedis('${(JSON.stringify(this.dato))}');`;
        return await db.listar(query);
    }

}

module.exports = ReciboCedisTarimaModel;
