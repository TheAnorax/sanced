const express = require("express");
const router = express.Router();
const { Upload_Report_Prob, get_SKU_Info, Get_Repo_Info, Update_Status, Delete_Repo } = require("../controller/repo_prob_controller");

// Ruta para subir reportes
router.post("/upload", Upload_Report_Prob);

// Ruta para obtener información de SKU
router.get("/sku-info", get_SKU_Info);

// Usar la función Get_Repo_Info como controlador directamente en la ruta
router.get("/repo-info", Get_Repo_Info);

// Ruta para actualizar el estatus
router.put("/update-status", Update_Status);

// Ruta para eliminar el reporte
router.delete("/delete-report", Delete_Repo);

module.exports = router;
