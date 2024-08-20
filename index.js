const express = require("express");
const cors = require("cors");
// const cookieParser = require('cookie-parser');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5300;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://merch-maven-server.vercel.app",
      "https://merch-maven.web.app",
    ],
  })
);

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbm5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const productsCollection = client
      .db("MerchMavenDB")
      .collection("productsCollection");

    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 9;
      const search = req.query.search || "";
      const sortType = req.query.sortType || "price";
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
      

      const query = {
        ...search && { productName: { $regex: search, $options: "i" } }
      };

      const sort = { [sortType]: sortOrder };

      const result = await productsCollection
        .find(query)
        .sort(sort)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/productsCount", async (req, res) => {
      const search = req.query.search || "";

      // Define the search query for counting
      const query = search
        ? { productName: { $regex: search, $options: "i" } }
        : {};
      const count = await productsCollection.estimatedDocumentCount(query);
      res.send({ count });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Merch Maven Server is OnGoing!");
});
app.listen(port, () => {
  console.log(`Server is running on port${port}`);
});
