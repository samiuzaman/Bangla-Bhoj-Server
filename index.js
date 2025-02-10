const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tkh8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const AllMenuCollection = client.db("Bangla_Bhoj").collection("Menu");
    const AllCategoryCollection = client
      .db("Bangla_Bhoj")
      .collection("Category");

    // Bangla Bhoj Menu Items
    app.get("/menus", async (req, res) => {
      const category = req.query.category;
      const { search } = req.query;
      let query = {};
      if (category === "All-Item") {
        query = {};
      } else if (category) {
        query = { category: category };
      }
      if (search) {
        query = { name: { $regex: search, $options: "i" } };
      }
      const menu = await AllMenuCollection.find(query).toArray();
      res.send(menu);
    });
    app.get("/special-menu", async (req, res) => {
      const menu = await AllMenuCollection.find()
        .sort({ orderCount: -1 })
        .limit(4)
        .toArray();
      res.send(menu);
    });

    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const item = await AllMenuCollection.findOne(query);
      res.send(item);
    });

    // Bangla Bhoj Category
    app.get("/category", async (req, res) => {
      const category = await AllCategoryCollection.find().toArray();
      res.send(category);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Running...");
});

app.listen(port, () => {
  console.log(`Express App Running port: ${port}`);
});
