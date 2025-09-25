const ReciboCedisModel = require('../modelaplication/reciboCedisModel.js');
const path = require('path');
const fs = require('fs');

    const reciboListas = async (req,res) => {
        try {
            const bodyL = req.body;
            
            const listarecibo = new ReciboCedisModel(bodyL);
            const guardar = await listarecibo.reciboLista();
            res.json(guardar);
        }catch(error){
            res.json({message : error.message});
        }
    };

    const reciboTarimas = async (req, res) => {
        try {
            const bodyT = req.body;
            const tarrecibo = new ReciboCedisModel(bodyT);
            const guardar = await tarrecibo.reciboTarima();
            res.json(guardar)
        } catch (error) {
            res.json({message : error.message})
        }
    };

    const reciboSaves = async (req, res) => {
        try {
            const bodyS = req.body;
            const savrecibo = new ReciboCedisModel(bodyS);
            const guardar = await savrecibo.reciboSave();
            res.json(guardar);
        } catch (error) {
            res.json({message : error.message});
        }
    };

    const reciboCedlis = async (req, res) => {
        try {
            res.json(await ReciboCedisModel.reciboCedis()); 
        } catch (error) {
            res.json({message : error.message});
        }
    };

    const reciboDetalles = async (req, res) => {
        try {
            const bodyD = req.body;
            const detrecibo = new ReciboCedisModel(bodyD);
            const guardar = await detrecibo.reciboDetalle();
            res.json(guardar);
        } catch (error) {
            res.json({message : error.message});
        }
    };

    const reciboActualizars = async (req, res) => {
        try {
            const bodyA = req.body;
            const actrecibo = new ReciboCedisModel(bodyA);
            const guardar = await actrecibo.reciboActualizar();
            res.json(guardar);
        } catch (error) {
            res.json({message : error.message});
        }

    };

    const reciboReporte = async (req, res) => {
        try {
            res.json(await ReciboCedisModel.reciboReporte());
        } catch (error) {
            res.json({message : error.message});
        }    
    };

    const reciboUploadPDF = async (req, res) => {
        try {
          // Validación de que los archivos existan
          if (!req.files || Object.keys(req.files).length === 0) {
            console.error("No se recibieron archivos.");
            return res.status(400).json({ message: "No se subieron archivos." });
          }
      
          const { id_recibo } = req.body;
      
          if (!id_recibo) {
            console.error("id_recibo no recibido en el cuerpo de la solicitud.");
            return res.status(400).json({ message: "Falta el campo id_recibo." });
          }
      
          // Construir el objeto `data` solo con los campos de PDF que se enviaron
          const data = { id_recibo }; // Incluir siempre el ID del recibo
      
          if (req.files['pdf_1']) {
            data.pdf_1 = req.files['pdf_1'][0].filename;
          }
          if (req.files['pdf_2']) {
            data.pdf_2 = req.files['pdf_2'][0].filename;
          }
          if (req.files['pdf_3']) {
            data.pdf_3 = req.files['pdf_3'][0].filename;
          }
          if (req.files['pdf_4']) {
            data.pdf_4 = req.files['pdf_4'][0].filename;
          }
          if (req.files['pdf_5']) {
            data.pdf_5 = req.files['pdf_5'][0].filename;
          }
      
          console.log("Datos a guardar en la base de datos:", data);
      
          // Solo se enviarán los datos de los PDFs que se hayan recibido
          const reciboModel = new ReciboCedisModel(data);
          const result = await reciboModel.savePDFs(); // Llamar al método del modelo para guardar en la BD
      
          res.json({ message: "Archivos subidos y guardados exitosamente.", result });
        } catch (error) {
          console.error("Error al guardar los PDFs:", error);
          res.status(500).json({ message: "Error al guardar los PDFs.", error });
        }
      };
      
      
    
    

module.exports = {
    reciboListas,
    reciboTarimas,
    reciboSaves,
    reciboCedlis,
    reciboDetalles,
    reciboReporte,
    reciboActualizars,
    reciboUploadPDF,
};