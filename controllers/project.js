const Project = require('../models/project.js');
const User = require('../models/user.js');
const Solicitacao = require('../models/solicitacoes.js')
const { TransacaoIncentivo } = require('../models/transacao_incentivo.js');
const { TransacaoCompra } = require('../models/transacao_compra.js');


module.exports = {
    async create(req, res) {
        try {
            // Captura os dados do usuário autenticado
            console.log("ENTROU NA ROTA CREATE PROJECT")
            const userId = res.locals.user.id;

            // Captura os dados do formulário
            const {
                name,
                quick_description,
                localization,
                field,
                instituition,
                status,
                pix,
                links,
                type_of_project,
                preco,
                team_members,
                goal,
                knowledge_used,
                reason_for_creation,
                society_impacts,
                progress,
                extra_informations
            } = req.body;

            // Criar o novo projeto com os dados fornecidos
            const novoProjeto = new Project({
                name,
                owner: userId,
                quick_description,
                localization,
                field,
                instituition,
                status,
                pix,
                links,
                preco,
                type_of_project,
                goal,
                team_members,
                knowledge_used,
                reason_for_creation,
                society_impacts,
                progress,
                extra_informations
            });

            // Salvar no banco de dados
            await novoProjeto.save();

            res.status(201).json({ success: true, message: 'Projeto criado com sucesso!', projeto: novoProjeto });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Erro ao criar o projeto.', error: error.message });
        }
    },
    async attachImages(req, res) {
        try {
            console.log("ENTROU NA ROTA ATTACH IMAGES")
            const projectId = req.body.projectId; // Pega o ID do projeto vindo do corpo da requisição

            // Verifica se o projeto existe
            const projeto = await Project.findById(projectId);
            if (!projeto) {
                return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
            }

            // Captura as imagens dos arquivos enviados
            const background_img = req.files && req.files['imagemFundo'] ? "projectImgs/" + req.files['imagemFundo'][0].filename : null;
            const logo_img = req.files && req.files['imagemLogo'] ? "projectImgs/" + req.files['imagemLogo'][0].filename : null;
            const extra_imgs = req.files && req.files['imagensExtras'] ? req.files['imagensExtras'].map(file => "projectImgs/" + file.filename) : [];

            // Atualiza os campos de imagem do projeto, se fornecidos
            if (background_img) projeto.background_img = background_img;
            if (logo_img) projeto.logo_img = logo_img;
            if (extra_imgs.length > 0) projeto.extra_imgs = extra_imgs;

            // Salva as mudanças no banco de dados
            await projeto.save();

            res.status(200).json({ success: true, message: 'Imagens anexadas com sucesso!', projeto });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Erro ao anexar as imagens.', error: error.message });
        }
    },
    async getAll(req, res) {
        try {
            const projects = await Project.find().populate(["owner", "team_members"]).populate({ path: "incentivos", populate: { path: "person_id" } });
            res.status(200).json(projects);

        } catch (e) {
            res.status(500).json({ message: 'Erro ao buscar projetos', error });
        }
    },
    async like(req, res) {
        try {
            const userId = res.locals.user.id; // Captura o ID do usuário autenticado
            const { projectId } = req.body; // Captura o ID do projeto da requisição

            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
            }

            // Adiciona o ID do usuário no array likedBy, se ainda não estiver presente
            if (!project.likedBy.includes(userId)) {
                project.likedBy.push(userId);
                await project.save();
                return res.status(200).json({ success: true, message: 'Projeto curtido com sucesso!' });
            } else {
                return res.status(400).json({ success: false, message: 'Usuário já curtiu este projeto.' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Erro ao curtir o projeto.', error: error.message });
        }
    },

    async dislike(req, res) {
        try {
            const userId = res.locals.user.id;
            const { projectId } = req.body;

            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
            }

            // Remove o ID do usuário do array likedBy, se estiver presente
            const index = project.likedBy.indexOf(userId);
            if (index > -1) {
                project.likedBy.splice(index, 1);
                await project.save();
                return res.status(200).json({ success: true, message: 'Projeto descurtido com sucesso!' });
            } else {
                return res.status(400).json({ success: false, message: 'Usuário não curtiu este projeto.' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Erro ao descurtir o projeto.', error: error.message });
        }
    },

    async getProjectById(req, res) {
        try {
            const { id } = req.params; // Captura o ID do projeto dos parâmetros da URL
            const project = await Project.findById(id); // Busca o projeto no banco de dados pelo ID

            if (!project) {
                return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
            }

            res.status(200).json({ success: true, project });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Erro ao buscar o projeto.', error: error.message });
        }
    },
    async edit(req, res) {
        try {

            console.log("ENTROU NA ROTA EDIT")

            const projectId = req.params.id; // Captura o ID do projeto dos parâmetros da URL
            const userId = res.locals.user.id; // Captura o ID do usuário autenticado

            const currentUser = await User.findById(userId);
            if (!currentUser) {
                return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
            }


            // Busca o projeto no banco de dados
            const projeto = await Project.findById(projectId);
            if (!projeto) {
                return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
            }



            // Atualiza os campos fornecidos no corpo da requisição
            const {
                name,
                quick_description,
                localization,
                field,
                instituition,
                status,
                pix,
                links,
                preco,
                type_of_project,
                goal,
                team_members,
                knowledge_used,
                reason_for_creation,
                society_impacts,
                progress,
                extra_informations,
                incentivo // Novo campo para adicionar incentivos
            } = req.body;

            // Atualiza os campos existentes
            if (name) projeto.name = name;
            if (quick_description) projeto.quick_description = quick_description;
            if (localization) projeto.localization = localization;
            if (field) projeto.field = field;
            if (instituition) projeto.instituition = instituition;
            if (status) projeto.status = status;
            if (pix) projeto.pix = pix;
            if (links) projeto.links = links;
            if (preco) projeto.preco = preco;
            if (type_of_project) projeto.type_of_project = type_of_project;
            if (goal) projeto.goal = goal;
            if (team_members) projeto.team_members = team_members;
            if (knowledge_used) projeto.knowledge_used = knowledge_used;
            if (reason_for_creation) projeto.reason_for_creation = reason_for_creation;
            if (society_impacts) projeto.society_impacts = society_impacts;
            if (progress) projeto.progress = progress;
            if (extra_informations) projeto.extra_informations = extra_informations;

            // Adiciona novos incentivos, se fornecidos

            console.log(currentUser)

            if (incentivo) {

                projeto.incentivos.push({
                    person_id: currentUser._id,
                    value: incentivo
                });

            }

            // Salva as mudanças no banco de dados
            await projeto.save();

            res.status(200).json({ success: true, message: 'Projeto atualizado com sucesso!', projeto });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Erro ao editar o projeto.', error: error.message });
        }
    },
    async transacaoIncentivo(req, res) {
        const userId = res.locals.user.id;

        const project = await Project.findById(req.body.projectId);

        if (project == null) {
            res.status(404).send("Não há nenhum projeto com esse id");
            return;
        }
        const transacao = new TransacaoIncentivo({
            user: userId,
            project: req.body.projectId,
            value: req.body.value
        })

        await transacao.save();




        //api do pagueBank

        const request = await fetch("https://sandbox.api.pagseguro.com/checkouts", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${process.env.PAGUEBANK_AUTHTOKEN}`
            },
            body: JSON.stringify({
                customer: req.body.customer,
                items: [{
                    reference_id: transacao._id,
                    name: `Incentivo: ${project.name}`,
                    description: `Um incentivo, apoio ou doação, foi realizado para o projeto ${project.name}`,
                    quantity: 1,
                    unit_amount: transacao.value
                }],
                reference_id: transacao._id,
                customer_modifiable: false,
                payment_notification_urls: [process.env.PUBLIC_API_URL + `/project/n/${transacao._id}`],
                redirect_url: `${process.env.PUBLIC_API_URL}/projetos/saiba-mais/${transacao.project}`
            })
        });

        const json = await request.json();
        console.log(json);
        res.send({ transacao, redirect_url: json.links[1].href });

    },
    async pagueBankTransactionCheckoutNotify(req, res) {
        const charges = req.body?.charges;
        const charge = charges != null ? charges[0] : null
        if (charge?.status != "PAID") {
            res.send();
            return
        }
        console.log("pagBankFuncionou", req.params.transactionId);
        const transacao = await TransacaoIncentivo.findByIdAndDelete(req.params.transactionId)

        if (transacao != null) {
            const project = await Project.findById(transacao.project);
            let finalValue;
            const valueString = transacao.value.toString();
            if (valueString.length <= 2) {
                const zeroCount = 2 - valueString.length;
                let zeros = '';
                for (let c = 0; c < zeroCount; c++) {
                    zeros += '0';
                }
                finalValue = Number(`0.${zeros}${value}`);
            }
            else {
                const cents = valueString.substring(valueString.length - 2);
                const integerValue = valueString.substring(0, valueString.length - 2);
                finalValue = Number(`${integerValue}.${cents}`)
            }

            project.incentivos.push({
                person_id: transacao.user, value: finalValue

            });
            await project.save();
        }

        res.send()
    },
    async transacaoCompra(req, res) {
        const userId = res.locals.user.id;
        const project = await Project.findById(req.body.projectId);

        if (project == null || project.preco == null) {
            res.status(404).send("Não há nenhum projeto com esse id");
            return;
        }
        const transacao = new TransacaoCompra({
            newOwner: userId,
            oldOwner: project.owner,
            project: req.body.projectId,
            value: Number(project.preco.toFixed(2).replace(".", ""))
        })

        await transacao.save();

        //api do pagueBank

        const request = await fetch("https://sandbox.api.pagseguro.com/checkouts", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${process.env.PAGUEBANK_AUTHTOKEN}`
            },
            body: JSON.stringify({
                customer: req.body.customer,
                items: [{
                    reference_id: transacao._id,
                    name: `Compra: ${project.name}`,
                    description: `Uma compra do projeto: ${project.name} foi realizada`,
                    quantity: 1,
                    unit_amount: transacao.value
                }],
                reference_id: transacao._id,
                customer_modifiable: false,
                payment_notification_urls: [process.env.PUBLIC_API_URL + `/project/c/${transacao._id}`],
                redirect_url: `${process.env.PUBLIC_API_URL}/projetos/saiba-mais/${transacao.project}`
            })
        });

        const json = await request.json();
        console.log(json);
        res.send({ transacao, redirect_url: json.links[1].href });

    }, async pagueBankTransactionCheckoutNotifyCompra(req, res) {
        console.log("console.log('console.log(`console.log()`)')",);
        const charges = req.body?.charges;
        const charge = charges != null ? charges[0] : null
        if (charge?.status != "PAID") {
            res.send();
            return
        }
        console.log("pagBankFuncionou", req.params.transactionId);
        const transacao = await TransacaoCompra.findById(req.params.transactionId)

        if (transacao != null && transacao.status == 0) {
            const project = await Project.findById(transacao.project);

            project.owner = transacao.newOwner;
            project.team_members = [];
            transacao.status = 1;
            transacao.createdAt = undefined;
            await transacao.save();
            await project.save();
        }

        res.send()
    },
    async searchProjects(req, res) {
        try {
            const { query } = req.query;

            // Busca nos campos 'name', 'quick_description', 'field', 'localization', 'instituition' e 'status' que contenham o termo
            const projects = await Project.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { quick_description: { $regex: query, $options: 'i' } },
                    { field: { $regex: query, $options: 'i' } },
                    { localization: { $regex: query, $options: 'i' } },
                    { instituition: { $regex: query, $options: 'i' } },
                    { status: { $regex: query, $options: 'i' } }
                ]
            });

            res.json(projects);
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
            res.status(500).json({ message: 'Erro ao buscar projetos' });
        }
    }, async deleteMember(req, res) {
        const { pjId, memberId } = req.body;



        const project = await Project.findById(pjId);
        const user = await User.findById(memberId)

        if (project && user) {
            let index = project.team_members.indexOf(memberId)
            project.team_members.splice(index, 1)
            project.save()
        }
        res.send()
    }, async solicitacao(req, res) {
        // Extrair variáveis do corpo da requisição
        const { pjId, username, status, getAll } = req.body;

        console.log(pjId, username, status, getAll);

        // Buscar o projeto e o usuário no banco de dados
        const project = await Project.findById(pjId);
        const user = await User.findOne({ username });

        // Verificar se o usuário foi encontrado antes de tentar acessar _id
        if (!user) {
            res.json({ msg: "Usuário não encontrado!" });
            return;
        }

        // Procurar uma solicitação existente do usuário
        const solicitacao = await Solicitacao.findOne({ user: user._id });

        // Verificar se `getAll` foi solicitado para obter todas as solicitações
        if (getAll) {
            const solicitacoes = await Solicitacao.find()
                .populate("user")
                .populate("project");

            res.json({ solicitacoes });
            return;
        }

        // Verificar se já existe uma solicitação para o usuário
        if (solicitacao) {
            res.json({ msg: "Já existe uma solicitação para esse usuário!" });
            return;
        }

        // Se o usuário e o projeto existirem, criar uma nova solicitação
        if (project) {
            const novaSolicitacao = new Solicitacao({
                user: user._id,
                project: project._id,
                status: status
            });

            await novaSolicitacao.save();
            res.json({ msg: `Solicitação enviada para o usuário: #${user.username}!` });
        } else {
            res.json({ msg: "Projeto não encontrado!" });
        }
    }
    , async solicitacaoTratamento(req, res) {
        const { solicitacaoId, memberId, pjId, status } = req.body;

        const project = await Project.findById(pjId);
        const user = await User.findById(memberId);
        const solicitacao = await Solicitacao.findById(solicitacaoId);

        if (!project || !user || !solicitacao) {
            res.json({ msg: "Projeto, usuário ou solicitação não encontrado!" });
            return;
        }

        if (status === "aceitado") {
            if (!project.team_members.includes(user._id)) {
                project.team_members.push(user._id);
                await project.save();
            }
            await Solicitacao.findByIdAndDelete(solicitacaoId);

            res.json({ msg: `Você agora está participando do projeto ${project.name}!` });
        } else if (status === "recusado") {

            await Solicitacao.findByIdAndDelete(solicitacaoId);

            res.json({ msg: `Solicitação recusada.!` });
        }
    }, async deleteProject(req, res) {
        const { pjId } = req.body;

        const project = await Project.findById(pjId);
        const user = await User.findById(res.locals.user.id);

        if (project.owner.equals(user._id)) {
            console.log("O usuário é o proprietário do projeto");
            await Project.findByIdAndDelete(project._id)
            console.log("Projeto excluido")
            res.json({ msg: "sucesso" })
        } else {
            console.log("O usuário não é o proprietário do projeto");
            res.status(403).json({ msg: "Permissão negada!" });
        }
    }




}