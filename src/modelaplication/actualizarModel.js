const db = require('../config/databaseapp.js');

class Actualizar{
    constructor (datos) {
        this.datos = datos;
    }

    async actualizarBahia() {
        const queryB = `CALL sp_UpdateBahia('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryB);
    }

    async actualizarProductos() {
        const queryP = `CALL sp_UpdateProductos('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryP)
    }

    async actualizarEmbarque() {
        const queryE = `CALL sp_UpdateEmbarques('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryE);
    }

    async actualizarNoSurtido() {
        const queryNS = `CALL sp_UpdateNoSurtido('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryNS);
    }

    async actualizarEstado() {
        const queryEst = `CALL sp_updateEstado('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryEst);
    }

    static async actualizarReabasto() {
        const queryR = `CALL sp_viewListReabastecimiento();`;
        return await db.listar(queryR);
    }
}

module.exports = Actualizar;