const db = require('../config/databaseapp.js');

class ReciboCedisModel {
    constructor(datos){ 
        this.datos = datos;
    }

    async reciboLista() {
        const queryL = `CALL sp_viewRecibosCedis('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryL);
    }

    async reciboTarima() {
        const queryT = `CALL sp_newReciboCedis('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryT);
    }

    async reciboSave() {
        const queryS = `CALL sp_saveReciboCedis('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryS);
    }

    static async reciboCedis() {
        const queryC = 'CALL sp_viewListRecibo()';
        return await db.listar(queryC);
    }

    async reciboDetalle() {
        const queryD = `CALL sp_ViewDetRecibo('${(JSON.stringify(this.datos))}')`;
        return await db.listar(queryD);
    }

    async reciboActualizar() {
        const queryA = `CALL sp_updateVolumetria('${(JSON.stringify(this.datos))}');`;
        return await db.listar(queryA);
    }

    static async reciboReporte(){
        const queryR = 'CALL sp_viewRepRecibo()';
        return await db.listar(queryR); 
    }

    async savePDFs() {
        // Crear un JSON con los datos
        const jsonData = JSON.stringify({
          id_recibo: this.datos.id_recibo,
          pdf_1: this.datos.pdf_1 || null,
          pdf_2: this.datos.pdf_2 || null,
          pdf_3: this.datos.pdf_3 || null,
          pdf_4: this.datos.pdf_4 || null,
          pdf_5: this.datos.pdf_5 || null // Añadir el 5to archivo
        });
      
        console.log("JSON enviado a la BD:", jsonData);
      
        // Llamar al procedimiento almacenado pasando el JSON como parámetro
        const query = `CALL sp_saveReciboPDFs('${jsonData}')`;
        return await db.listar(query);
      }
      
}

module.exports = ReciboCedisModel;