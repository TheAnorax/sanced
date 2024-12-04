const db = require('../config/databaseapp.js');

class Inventario_P {

    
    constructor(datos) {
        this.datos = datos;
    }

    async Obtenerinventario() {
        const queryB = `CALL sp_obtener_ubicaciones('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryB);
    }

    async ReducirInventario() {
        const queryB = `CALL sp_movAlma('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryB);
    }
    
    async ObtenerUbica() {
        const queryB = `CALL sp_obtener_ubi('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryB);
    }

    async Actualizarubi() {
        const queryB = `CALL sp_UpdateUbiAlma('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryB);
    }

    async BorrarDatos() {
        const queryB = `CALL sp_transferirDatos('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryB);
    }

    static async Obtinv() {
        const query = 'CALL sp_obtenerRedAlmpick();';
        return await db.listar(query);
    }

    static async Obtubi() {
        const query = 'CALL sp_obtener_ubi_alma();';
        return await db.listar(query);
    }

    static async Obtubibacias() {
        const query = 'CALL GetEmptyCodeProd();';
        return await db.listar(query);
    }

    static async Maq() {
        const query = 'CALL sp_obtenerMaqExterna();';
        return await db.listar(query);
    }

    static async Cua() {
        const query = 'CALL sp_obtenerCuarentena();';
        return await db.listar(query);
    }

    static async Exp() {
        const query = 'CALL sp_obtenerExportaciones();';
        return await db.listar(query);
    }

    static async Seg() {
        const query = 'CALL sp_obtenerSegunda();';
        return await db.listar(query);
    }

    static async Dev() {
        const query = 'CALL sp_obtenerDevoluciones();';
        return await db.listar(query);
    }

    static async Dif() {
        const query = 'CALL sp_obtenerDiferencia();';
        return await db.listar(query);
    }

    static async Mue() {
        const query = 'CALL sp_obtenerMuestras();';
        return await db.listar(query);
    }
//88
    static async Red() {
        const query = 'CALL sp_obtener_red_ubi();';
        return await db.listar(query);
    }

}


module.exports = Inventario_P;