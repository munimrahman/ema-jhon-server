const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.luqwr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('ema-jhon');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');

        // GET Method || Get All Document
        app.get('/products', async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const cursor = productsCollection.find({})
            let products;
            const count = await cursor.count();
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
            })
        })

        // POST Method || Create a Document to Insert
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result)
        })

        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productsCollection.find(query).toArray()
            res.json(products)
        })

        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ema-Jhon Server is Running')
})

app.listen(port, () => {
    console.log('Ema-Jhon Server is Running on Post', port);
})