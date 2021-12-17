const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gdsos.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run(){
   
    try{
      await client.connect();
      const database = client.db('bike_niche')
      const productsCollection = database.collection('products')
      const ordersCollection = database.collection('orders')
      const usersCollection = database.collection('users')
      const reviewsCollection = database.collection('reviews')
      
    //   get method

      app.get('/products' , async(req,res)=>{
          const products = productsCollection.find({})
          const result = await products.toArray();
          res.send(result)
      })

      app.get('/allOrders' , async(req,res)=>{
        const allOrders = ordersCollection.find({})
        const result = await allOrders.toArray()
        res.send(result);
      })

      app.get('/purchase/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await productsCollection.findOne(query);
        res.json(result);
      })

    // put method
    
    app.post('/users' , async(req,res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user)
        console.log(result);
        res.json(result)
        
      })
    app.post('/reviews' , async(req,res)=>{
        const reviews = req.body;
        const result = await reviewsCollection.insertOne(reviews)
        console.log(result);
        res.json(result)
        
      })

    app.get('/allReviews' , async(req,res) => {
      const reviews =reviewsCollection.find({})
      const result = await reviews.toArray()
      res.send(result)
    })

      app.get('/users/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {email:email}
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
          isAdmin=true;
        }
        res.json({admin:isAdmin});
      })

      app.put('/users' , async(req,res)=>{
        const user = req.body;
        const filter = {email:user.email};
        const options = { upsert:true }
        const updateDoc = { $set:user };
        const result =  await usersCollection.updateOne(filter,updateDoc,options)
        // console.log(result);
        res.json(result)
      })

      app.put('/users/admin' , async(req,res)=>{
        const user = req.body;
        const filter = {email: user.email}
        const updateDoc = {$set:{role:'admin'}};
        const result = await usersCollection.updateOne(filter,updateDoc)
        res.json(result);
      })
      app.put('/allOrders/:id' , async(req,res)=>{
        const id = req.params.id;
         const updatedStatus = req.body.status;
         const filter = { _id: ObjectId(id) };
         console.log(updatedStatus);
         ordersCollection
           .updateOne(filter, {
             $set: { status: updatedStatus },
           })
           .then((result) => {
             res.send(result);
           });
       });

    // post method
    app.post('/orders',async(req,res)=>{
        const orders = req.body;
        const result = await ordersCollection.insertOne(orders)
       res.json(result)
    })

    app.post('/addProduct' , async(req,res)=>{
      const addProduct = req.body;
      const result = await productsCollection.insertOne(addProduct)
      res.json(result)
    })

    // get orders
    app.get('/orders' , async (req,res) =>{
        const email = req.query;
        const query ={email:email.email}
       
        const cursor = ordersCollection.find(query)
        const result = await cursor.toArray()
       
        res.json(result)
      })
    
    //   Delete Orders
    app.delete('/delete/:id',async(req,res)=>{
        console.log(req.params);
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        console.log((query));
        const result = await ordersCollection.deleteOne(query);
        res.json(result);
    })
    app.delete('/allOrders/:id',async(req,res)=>{
        console.log(req.params);
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        console.log((query));
        const result = await ordersCollection.deleteOne(query);
        res.json(result);
    })
    app.delete('/deleteProducts/:id',async(req,res)=>{
        console.log(req.params);
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        console.log((query));
        const result = await productsCollection.deleteOne(query);
        res.json(result);
    })

    }
    finally{

    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello!')
  })
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })