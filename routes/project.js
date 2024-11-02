const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/projectImgs/'); // Pasta onde as imagens serão salvas
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Formato de arquivo inválido, apenas imagens são permitidas.'), false);
    }
};

// Configuração do multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 7340032
    }
});


const authMiddleware = require("../middleware/authToken.js");

const {
    searchProjects,
    create,
    attachImages,
    getAll,
    like,
    dislike,
    getProjectById,
    edit,
    transacaoIncentivo,
    pagueBankTransactionCheckoutNotify,
    transacaoCompra,
    pagueBankTransactionCheckoutNotifyCompra,
    deleteMember,
    solicitacao,
    solicitacaoTratamento,
    deleteProject
} = require("../controllers/project.js");

router.put("/attachImages", authMiddleware, upload.fields([
    { name: 'imagemFundo', maxCount: 1 },
    { name: 'imagemLogo', maxCount: 1 },
    { name: 'imagensExtras', maxCount: 10 }
]), attachImages);

router.use(express.json());

router.post("/solicitacao", authMiddleware, solicitacao)

router.delete("/solicitacaoTratamento", authMiddleware, solicitacaoTratamento)

router.delete("/deleteMember", authMiddleware, deleteMember);

router.delete("/deleteProject", authMiddleware, deleteProject);

router.get('/search', searchProjects);

router.put("/like", authMiddleware, like);

router.put("/dislike", authMiddleware, dislike);

router.post("/create", authMiddleware, create);

router.get("/getAll", getAll);

router.get("/getById/:id", getProjectById);

router.put("/edit/:id", authMiddleware, edit);

router.post("/transacaoIncentivo", authMiddleware, transacaoIncentivo);

router.post("/n/:transactionId", pagueBankTransactionCheckoutNotify)

router.post("/transacaoCompra", authMiddleware, transacaoCompra);

router.post("/c/:transactionId", pagueBankTransactionCheckoutNotifyCompra)

module.exports = router