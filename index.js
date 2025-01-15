const {MongoClient} = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try{

    await client.connect();
    console.log("Banco de dados conectado");
    const db = client.db("devsfuturo");
    const collection = db.collection("devs");

    await collection.insertOne({name: "Ageu", age: 26 });
    
    console.log("Dev cadastrado com sucesso");

    const dev = { name: "Ageu",}
    const result = await collection.findOne(dev)
    console.log("Dev encontrado com sucesso", result);


    }finally{
        await client.close();}

}


run().catch(console.dir);