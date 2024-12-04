const db = require('../config/databaseapp.js');

class InsumoModel {

    constructor(datos) {
        this.datos = datos;
    }

    static async listaInsumoCedis() {
        const query = 'call sp_obtener();';
        return await db.listar(query);
    }


    async ObtenerCodigo() {
        const queryB = `CALL sp_obtenercodigo('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryB);
    }

    async newInsumo() {
        const queryT = `CALL sp_newinsumo('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryT);
    }

    async updateInsumo() {
        const queryT = `CALL sp_redinsumos('${(JSON.stringify(this.datos))}');`
        return await db.listar(queryT);
    }

    async modifyInsumo() {
        const queryT = `CALL sp_modificar_insumo('${(JSON.stringify(this.datos))}');`
        return await db.listar(queryT);
    }

    async ingresoInsumos() {
        const queryT = `CALL sp_aumeninsumos('${(JSON.stringify(this.datos))}');`
        return await db.listar(queryT);
    }

    static async Insumosagregados() {
        const queryT = 'CALL sp_obtener_entrada_insumos();';
        return await db.listar(queryT);
    } 

    static async Insumosreducidos() {
        const queryT = 'CALL sp_obtener_reduccion_insumos();';
        return await db.listar(queryT);
    }
    

}

module.exports = InsumoModel;