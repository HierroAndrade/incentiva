const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/userLogos"); // Defina a pasta de destino
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Define o nome do arquivo
    }
});



const upload = multer({ storage: storage, limits: { fileSize: 7340032 } });

const authMiddleware = require("../middleware/authToken.js");

const { register, login, edit, get, attachLogo, like, dislike, verificaEmail, verificaCodigo, contato, esqueciSenha, verificarCodigoEsqueciSenha, redefinirSenha } = require("../controllers/user.js");

router.put("/verificaCodigo", authMiddleware, verificaCodigo);

router.post("/verificaEmail", verificaEmail);

router.post("/register", register);

router.post("/login", login);

router.get("/get", authMiddleware, get);

router.get("/get/:username", get);

router.put("/attachLogo", authMiddleware, upload.fields([{ name: 'user_logo', maxCount: 1 }]), attachLogo);

router.use(express.json())

router.post("/contato", contato);

router.post("/esqueci-senha", esqueciSenha); // Envia o código para o email
router.put("/verificaCodigoSenha", verificarCodigoEsqueciSenha); // Verifica o código
router.put("/redefinirSenha", redefinirSenha);

router.use(authMiddleware);

router.put("/edit", edit);

router.put('/like', like);

router.put('/dislike', dislike);




module.exports = router;