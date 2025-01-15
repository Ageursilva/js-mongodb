const {MongoClient} = require("mongodb");
const bodyParser = require("body-parser");
const express = require("express");
const path = require('path');

const app = express();
app.use(bodyParser.json());
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

app.use(express.static(path.join(__dirname, 'public')));
 
let db, collection;
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB");
        db = client.db("devsfuturo");
        collection = db.collection("devs");
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
    }
}

connectToDatabase().catch(console.error);
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})
app.get("/devs", async (req, res) => {
    const devs = await collection.find().toArray();
    res.status(200).send(devs);
});

app.get("/devs/:name", async (req, res) => {
    const{name} = req.params;
    const dev = await collection.findOne({name});
    if (dev) {
        res.status(200).send(dev);
    } else {
        res.status(404).send({message: "Dev não encontrado"});
    }
});

app.post("/devs", async (req, res) => {
    const {name, age} = req.body;
    const dev = {name, age};
    await collection.insertOne(dev);
    res.status(201).send({message: "Dev cadastrado com sucesso"});
});

app.put("/devs/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const { age } = req.body;

        if (!age) {
            return res.status(400).send({ message: "O campo 'age' é obrigatório." });
        }

        const regex = new RegExp(`^${name}$`, "i"); 

        console.log("Nome recebido para atualização:", name);

        const result = await collection.updateOne(
            { name: { $regex: regex } }, 
            { $set: { age } } 
        );

        console.log("Resultado da atualização:", result);

        if (result.matchedCount > 0) {
            res.status(200).send({ message: "Dev atualizado com sucesso" });
        } else {
            res.status(404).send({ message: "Dev não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao atualizar dev:", error);
        res.status(500).send({ message: "Erro interno no servidor" });
    }
});

app.delete("/devs/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const regex = new RegExp(`^${name}$`, "i");

        console.log("Nome recebido para exclusão:", name);

        const result = await collection.deleteOne({ name: { $regex: regex } });
        console.log("Resultado da exclusão:", result);

        if (result.deletedCount > 0) {
            res.status(200).send({ message: "Dev deletado com sucesso" });
        } else {
            res.status(404).send({ message: "Dev não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao deletar dev:", error);
        res.status(500).send({ message: "Erro interno no servidor" });
    }
});
app.listen(3000, () => {
    console.log("API rodando na porta 3000");
});