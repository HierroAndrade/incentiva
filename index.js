require('dotenv/config');

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT;
const Project = require('./models/project.js');
const Chat = require('./models/chat.js');
const { Message } = require('./models/message.js')
const authToken = require('./middleware/authToken.js')

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const ngrok = require("@ngrok/ngrok");
const express = require("express");
const expressLayout = require('express-ejs-layouts');
const app = express();
const { createServer } = require("http");
const server = createServer(app);
const { Server: SocketServer } = require("socket.io");
const io = new SocketServer(server);


app.use(expressLayout);
app.set("view engine", "ejs");
app.set("layout", "./layouts/main");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);


const mongoose = require('mongoose');
mongoose.connect(DB_URL).then(() => {
    console.log("Banco de dados conectado com sucesso!");
}).catch((e) => {
    console.log("Ocorreu um erro ao se conectar ao Banco de Dados " + e);
})

const path = require('path');
const fs = require('fs');


app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/project", require("./routes/project.js"));
app.use("/user", require("./routes/user.js"));


// app.get('/favicon.ico', (req, res) => res.status(204));
// app.use("*", (req, res) => {
//     const urlPath = req.originalUrl.replace("/", "")
//     if (fs.existsSync(path.resolve(`./views/${urlPath}.ejs`))) {
//         res.render(urlPath);
//     } else {
//         res.sendFile(path.resolve("./public/404.html"))
//     }
// });



app.use("*", async (req, res) => {
    const urlPath = req.originalUrl.split("/")[1]; // Pega a primeira parte do caminho

    // Verifica se existe um arquivo .ejs correspondente na pasta views
    if (fs.existsSync(path.resolve(`./views/${urlPath}.ejs`))) {
        res.render(urlPath);
    } else {
        try {
            console.log("url", req.originalUrl)
            // Caso não encontre, verifica se é uma rota com parâmetro
            if (req.originalUrl.startsWith("/projetos/saiba-mais/")) {



                const projectId = req.originalUrl.split("/")[3]; // Obtém o ID do projeto
                // Buscar o projeto no banco de dados e renderizar a view correspondente

                console.log("Project ID", projectId);

                const project = await Project.findById(projectId).populate(["owner", "team_members"]).populate({ path: "incentivos", populate: { path: "person_id" } })

                if (project) {
                    res.render("saiba-mais", { project });
                } else {
                    res.sendFile(path.resolve("./public/404.html"));
                }

            } else if (req.originalUrl.startsWith("/chat/")) {
                res.render("chat");

            } else {
                // Se não for uma rota estática ou rota válida com parâmetro, exibe a página 404
                res.sendFile(path.resolve("./public/404.html"));
            }
        } catch (e) {
            res.sendFile(path.resolve("./public/404.html"));
        }

    }
});



io.use((socket, next) => {

    const token = socket.handshake.query.token;

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (!err) {
            socket.user = user;

        }
        next();
    })
})

io.on("connection", async (socket) => {
    socket.on("disconnect", () => {
        console.log("User disconnected")
    })
    if (socket.user == null)
        return;


    const chats = await Chat.find({
        $or: [{ user: socket.user.id }, { user2: socket.user.id }]
    }).populate(["user", "user2"]).populate({ path: "messages", populate: { path: "sender" } })
    // chats.forEach(chat => socket.join(chat._id.toString()))

    for (let chat of chats)
        socket.join(chat._id.toString())



    socket.on("start chat", async (userId, callback) => {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            callback({ status: -1 });
            return;
        }

        const ongoingChat = chats.filter(c => (c.user._id == userId || c.user2._id == userId))[0];

        if (ongoingChat != null) {
            callback({ status: 1, chat: ongoingChat })
            return
        }

        const chat = new Chat({
            user: socket.user.id,
            user2: userId
        })

        await chat.save()

        chats.push(chat);
        socket.join(chat._id);
        callback({ status: 0, chat });
        console.log(socket.rooms);
    })

    socket.on("send message", async (msg, chatId, callback) => {
        try {

            console.log(chats)

            if (!socket.rooms.has(chatId)) {
                callback({ status: -1 })
                return

            }
            const project = chats.filter(c => c._id.equals(chatId))[0]
            let message = new Message({
                sender: socket.user.id,
                content: msg
            });

            project.messages.push(message);
            await project.save();
            message = await message.populate("sender")
            socket.broadcast.to(chatId).emit("new message", message, chatId);
            callback({ status: 0 })

        } catch (error) {
            console.log(error)
            callback({ status: -1 })
        }

    })

    socket.on("get chats", (cb) => {
        cb(chats)
    })

    socket.emit("socket ready")

})







server.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});

if (process.env.NGROK_AUTHTOKEN) {
    ngrok.connect({ addr: PORT, authtoken_from_env: true }).then(listener => {
        process.env.PUBLIC_API_URL = listener.url();
        console.log("Ngrok at: ", process.env.PUBLIC_API_URL);
    })
}
