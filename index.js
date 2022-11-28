const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

// MiddleWare
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d0hszsm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productCollections = client.db('mobile-resell-wizards').collection('products')
        const userCollections = client.db('mobile-resell-wizards').collection('user')
        const bookingsCollection = client.db('mobile-resell-wizards').collection('bookings')

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category: id };
            const result = await productCollections.find(query).toArray()
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const query = {}
            const result = await userCollections.find(query).toArray()
            res.send(result)
        })
        app.get('/sellers', async (req, res) => {
            const query = { type: "seller" }
            const result = await userCollections.find(query).toArray()
            res.send(result)
        })
        app.patch('/seller/verify', async (req, res) => {
            const queryEmail = req.query.email;
            const filter = { email: queryEmail }
            const query = { seller_email: queryEmail }
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    verified: true,
                },
            };
            const productResult = await productCollections.updateMany(query, updateDoc, options)
            const userResult = await userCollections.updateOne(filter, updateDoc, options);
            res.send(productResult)
        })
        app.get('/buyers', async (req, res) => {
            const query = { type: "buyer" }
            const result = await userCollections.find(query).toArray()
            res.send(result)
        })
        app.delete('/user/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await userCollections.deleteOne(query);
            res.send(result)
        })
        app.get('/user', async (req, res) => {
            const queryEmail = req.query.email;
            const query = { email: queryEmail }
            const result = await userCollections.find(query).toArray()
            res.send(result)
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const exists = await userCollections.find(query).toArray()
            if (!exists[0]) {
                const result = await userCollections.insertOne(user);
                res.send(result)
            }
            else {
                res.send(exists)
            }
        })
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollections.insertOne(product)
            res.send(result);
        })
        app.get('/products', async (req, res) => {
            const queryEmail = req.query.email;
            const query = { seller_email: queryEmail }
            const result = await productCollections.find(query).toArray()
            res.send(result)
        })
        app.delete('/product/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollections.deleteOne(query);
            res.send(result)
        })
        app.get('/products/advertised', async (req, res) => {
            const query = {
                advertised: true,
                status: "Available"
            }
            const result = await productCollections.find(query).toArray()
            res.send(result)
        })
        app.patch('/product/advertise/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    advertised: true
                },
            };
            const result = await productCollections.updateOne(filter, updateDoc, options);
            res.send(result)
        })
        app.get('/products/reports', async (req, res) => {
            const query = { reported: true }
            const result = await productCollections.find(query).toArray()
            res.send(result)
        })
        app.patch('/product/report/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    reported: true
                },
            };
            const result = await productCollections.updateOne(filter, updateDoc, options);
            res.send(result)
        })
        app.get('/bookings', async (req, res) => {
            const queryEmail = req.query.email;
            const query = { email: queryEmail }
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        })
        app.post('/bookings', async (req, res) => {
            const data = req.body;
            const query = {
                email: data.email,
                product: data.product,
            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You already have a booking for ${data.product}`
                return res.send({ acknowledged: false, message })
            }

            const result = await bookingsCollection.insertOne(data);
            res.send(result);
        });
    }
    finally { }
}

run().catch(err => console.log(err))


app.get('/', (req, res) => {
    res.send('server running');
});

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})