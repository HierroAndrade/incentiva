const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const BCRYPT_SALT = Number(process.env.BCRYPT_SALT);
const User = require('../models/user.js');
const Project = require('../models/project.js');
const JWT_SECRET = process.env.JWT_SECRET;
const Verificacao = require('../models/verificacao'); // Modelo de verificação
const nodemailer = require('nodemailer');

module.exports = {
    async register(req, res) {

        const { email, password } = req.body;

        try {

            const userExists = await User.findOne({ email });

            if (!userExists) {
                console.log(password, BCRYPT_SALT);
                const encodedPassword = await bcrypt.hash(password, BCRYPT_SALT);
                const newUser = new User({
                    email, password: encodedPassword
                })

                await newUser.save();
                res.status(201).json({ msg: "Cadastro realizado com sucesso!" });

            } else
                res.status(409).json({ msg: "Já existe um usuário com esse email" });


        } catch (error) {
            console.log(error);
        }
    },

    async login(req, res) {
        const authorization = req.headers['authorization'];
        const content = authorization?.split(" ")[1];
        if (content) {
            const informations = atob(content);
            const [email, password] = informations.split(":");
            try {
                const userExists = await User.findOne({ email })
                if (userExists) {
                    const passwordMatches = await bcrypt.compare(password, userExists.password);
                    if (passwordMatches) {
                        const token = jwt.sign({ id: userExists._id }, JWT_SECRET, { expiresIn: "7d" });
                        res.status(200).json({ token, username: userExists.username, verified: userExists.verified });
                    } else {
                        res.status(400).json({ msg: 'A senha está errada!' });
                    }

                } else {
                    res.status(400).json({ msg: 'Esse usuário não existe!' });
                }

            } catch (e) {
                console.log(e);
            }

        } else {
            res.status(400).json({ msg: "Credenciais obrigatórias!" })
        }
    },

    async edit(req, res) {
        try {
            delete req.body.password; delete req.body.email;
            const user = await User.findByIdAndUpdate(res.locals.user.id, req.body, { runValidators: true, new: true });
            res.send(user);
        } catch (e) {
            res.status(400).send(e);
        }


    },

    async get(req, res) {
        let userFound;
        if (req.params.username) {
            userFound = await User.findOne({ username: req.params.username });

        } else {
            userFound = await User.findById(res.locals.user.id);

        }
        console.log(res.locals.user);

        if (userFound) {
            res.json({ user: userFound });
        } else {
            res.json({ msg: "Usuário não existe" });
        }

    },

    async attachLogo(req, res) {
        console.log("ATACH LOGO")
        try {
            const userLogo = req.files['user_logo'][0];
            const user = await User.findByIdAndUpdate(res.locals.user.id, { profile_img: 'userLogos/' + userLogo.filename }, { runValidators: true, new: true });
            console.log("Logo img:" + userLogo.filename)
            res.send(user);
        } catch (e) {
            res.status(400).send(e);
        }

    },
    async like(req, res) {
        try {
            const userId = res.locals.user.id;
            const { projectId } = req.body;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User não encontrado' });
            }

            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
            }

            if (!user.projects_liked.includes(projectId)) {
                user.projects_liked.push(projectId);
                await user.save();
                return res.status(200).json({ success: true, message: 'Projeto curtido com sucesso!' });
            } else {
                return res.status(400).json({ success: false, message: 'Usuário já curtiu este projeto.' });
            }
        } catch (error) {
            console.error('Erro ao curtir o projeto:', error);
            res.status(500).json({ success: false, message: 'Erro ao curtir o projeto' });
        }
    },

    async dislike(req, res) {
        try {
            const userId = res.locals.user.id;
            const { projectId } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
            }

            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
            }


            // Remove o ID do usuário do array likedBy, se estiver presente
            const index = user.projects_liked.indexOf(projectId);
            if (index > -1) {
                user.projects_liked.splice(index, 1);
                await user.save();
                return res.status(200).json({ success: true, message: 'Projeto descurtido com sucesso!' });
            } else {
                return res.status(400).json({ success: false, message: 'Usuário não curtiu este projeto.' });
            }
        } catch (error) {
            console.error('Erro ao descurtir o projeto:', error);
            res.status(500).json({ success: false, message: 'Erro ao descurtir o projeto' });
        }
    },

    async verificaEmail(req, res) {
        const transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'empresa.sheltercode@gmail.com',
                pass: 'lvlm bckw fglh tyhq'
            },
            tls: {
                rejectUnauthorized: false
            }
        });


        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "O e-mail é obrigatório" });
        }

        async function gerarCodigoUnico() {
            let codigoUnico;
            let codigoExiste = true;

            // Tente gerar um código até encontrar um que não esteja no banco de dados
            while (codigoExiste) {
                const codigoGerado = Math.floor(100000 + Math.random() * 900000);
                const verificacaoExistente = await Verificacao.findOne({ codigo: codigoGerado });

                if (!verificacaoExistente) {
                    codigoUnico = codigoGerado;
                    codigoExiste = false; // Saia do loop
                }
            }

            return codigoUnico;
        }

        const codigo = await gerarCodigoUnico();

        // Criar ou atualizar o objeto de verificação no banco de dados
        try {
            const verificacaoExistente = await Verificacao.findOne({ email });

            if (verificacaoExistente) {
                verificacaoExistente.codigo = codigo;
                verificacaoExistente.status = "pendente";
                await verificacaoExistente.save();
            } else {
                const verificacao = new Verificacao({
                    email: email,
                    codigo: codigo,
                    status: "pendente"
                });
                await verificacao.save();
            }

            // Enviar o e-mail com o código
            await transport.sendMail({
                from: 'Shelter Code <empresa.sheltercode@gmail.com>',
                to: email,
                subject: 'Verificação de Email',
                html: `
                <html>
                    <head>
                        <style>
                            .pin { color: rgb(44, 144, 210); text-align: center; font-size: 21px; font-weight: bold; margin: 5px 0; }
                            .logo { width: 200px; height: auto; }
                            .textt { font-family: 'Poppins', sans-serif; color: black; font-size: 15px; }
                        </style>
                    </head>
                    <body>
                        <img src="https://drive.google.com/uc?id=1EHFs2vNzLPKQ74Gi3IzU734I5Uej4oqR" alt="Logo Incentiva" class="logo"/>
                        <p class="textt">Você solicitou a verificação de seu e-mail na plataforma Incentiva.</p>
                        <p class="pin">${codigo}</p>
                        <p class="textt">Utilize este código para validar sua conta.</p>
                        <p class="textt">Caso não tenha sido você quem solicitou, ignore este e-mail.</p>
                    </body>
                </html>
            `
            });

            res.status(200).json({ message: 'Código de verificação enviado com sucesso!' });
        } catch (error) {
            console.log('Erro ao enviar e-mail:', error);
            res.status(500).json({ message: 'Erro ao enviar e-mail de verificação' });
        }



    }, async verificaCodigo(req, res) {
        console.log("Entrou verifica codigo")
        let { codigo } = req.body;
        codigo = parseInt(codigo)
        const { email } = req.body;

        console.log("Coidgo e Email", codigo, email)
        try {
            // Procura no banco o código e o email do usuário autenticado
            const verificacao = await Verificacao.findOne({ email: email, codigo });

            if (!verificacao) {
                return res.status(400).json({ msg: "Código inválido ou não encontrado" });
            }

            // Se o código for válido, marca o usuário como verificado
            if (verificacao.status === "pendente") {
                verificacao.status = "concluído";
                await verificacao.save();

                // Atualiza o usuário para "verified: true"
                const user = await User.findOne({ email: email });
                if (user) {
                    user.verified = true;
                    await user.save();
                    return res.status(200).json({ msg: "Usuário verificado com sucesso" });
                }
            } else {
                return res.status(400).json({ msg: "Código já utilizado" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Erro interno ao verificar o código" });
        }
    },

    async contato(req, res) {
        const { nomeCompleto, email, mensagem } = req.body;

        console.log(nomeCompleto, email, mensagem);

        // Configuração do transport do Nodemailer
        const transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'empresa.sheltercode@gmail.com',
                pass: 'lvlm bckw fglh tyhq'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Estrutura do e-mail que será enviado
        try {
            await transport.sendMail({
                from: `${nomeCompleto} <${email}>`, // Nome e email do remetente
                to: 'sheltercode.Contato@gmail.com', // E-mail da Shelter Code que vai receber a mensagem
                subject: 'Contato do Usuário - ShelterCode', // Assunto do e-mail
                html: `
                    <html>
                        <head>
                            <style>
                                .header { font-family: 'Poppins', sans-serif; font-size: 16px; color: #2c90d2; font-weight: bold; }
                                .content { font-family: 'Poppins', sans-serif; font-size: 14px; color: #333; }
                            </style>
                        </head>
                        <body>
                            <p class="header">Você recebeu uma nova mensagem de contato através da plataforma Shelter Code.</p>
                            <p class="content"><strong>Nome:</strong> ${nomeCompleto}</p>
                            <p class="content"><strong>Email:</strong> ${email}</p>
                            <p class="content"><strong>Mensagem:</strong> ${mensagem}</p>
                        </body>
                    </html>
                `
            });

            return res.status(200).json({ msg: "Mensagem enviada com sucesso!" });
        } catch (err) {
            console.log('Erro ao enviar mensagem de contato:', err);
            return res.status(500).json({ msg: "Erro ao enviar a mensagem. Tente novamente mais tarde." });
        }
    },
    // Controller para iniciar o processo de "Esqueceu a Senha"
    async esqueciSenha(req, res) {

        const transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'empresa.sheltercode@gmail.com',
                pass: 'lvlm bckw fglh tyhq'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "O e-mail é obrigatório" });
        }

        // Verificar se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        // Verificar se o usuário já está verificado
        if (!user.verified) {
            return res.status(400).json({ message: "Usuário ainda não verificou o email" });
        }


        async function gerarCodigoUnico() {
            let codigoUnico;
            let codigoExiste = true;

            // Tente gerar um código até encontrar um que não esteja no banco de dados
            while (codigoExiste) {
                const codigoGerado = Math.floor(100000 + Math.random() * 900000);
                const verificacaoExistente = await Verificacao.findOne({ codigo: codigoGerado });

                if (!verificacaoExistente) {
                    codigoUnico = codigoGerado;
                    codigoExiste = false; // Saia do loop
                }
            }

            return codigoUnico;
        }
        // Reutilizar a lógica para gerar código único
        const codigo = await gerarCodigoUnico(); // Pode usar a mesma função de verificação de email

        // Atualizar ou criar o documento de verificação de senha
        let verificacao = await Verificacao.findOne({ email });
        if (verificacao) {
            verificacao.codigo = codigo;
            verificacao.status = "pendente";
            await verificacao.save();
        } else {
            verificacao = new Verificacao({
                email: email,
                codigo: codigo,
                status: "pendente"
            });
            await verificacao.save();
        }

        // Enviar o código para o email do usuário
        await transport.sendMail({
            from: 'Incentiva <no-reply@incentiva.com>',
            to: email,
            subject: 'Redefinição de Senha',
            html: `Seu código para redefinir a senha é: ${codigo}`
        });

        res.status(200).json({ message: "Código enviado para o email" });
    },
    // Controller para verificar o código
    async verificarCodigoEsqueciSenha(req, res) {
        let { codigo, email } = req.body;
        codigo = parseInt(codigo);

        // Procurar o código e o email
        const verificacao = await Verificacao.findOne({ email, codigo });

        if (!verificacao || verificacao.status !== "pendente") {
            return res.status(400).json({ message: "Código inválido ou expirado" });
        }

        // Atualizar status da verificação
        verificacao.status = "concluído";
        await verificacao.save();

        // Verificar se o usuário ainda não está verificado e, caso não, marcá-lo como verificado
        const user = await User.findOne({ email });
        if (user && !user.verified) {
            user.verified = true;
            await user.save();
        }

        res.status(200).json({ message: "Código verificado com sucesso, você pode redefinir a senha" });
    },
    // Controller para redefinir a senha
    async redefinirSenha(req, res) {
        const { email, novaSenha, confirmaSenha } = req.body;

        if (novaSenha !== confirmaSenha) {
            return res.status(400).json({ message: "As senhas não correspondem" });
        }

        // Buscar usuário e atualizar a senha
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        // Criptografar a nova senha
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(novaSenha, salt);

        await user.save();

        res.status(200).json({ message: "Senha redefinida com sucesso" });
    }






}
