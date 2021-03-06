const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rege1.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .send({ messege: "un authorozied access dont find header" });
  }

  const token = authHeader?.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ messege: "access forbidden " });
    }
    req.decoded = decoded;
  });
  next();
};

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("electro").collection("services");
    const userCollection = client.db("electro").collection("user");
    const orderCollection = client.db("electro").collection("order");
    const reviewCollection = client.db("electro").collection("review");
    const profileCollection = client.db("electro").collection("profiles");

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    // find all reviewes
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    // find all user to manage admin
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
    // find all orders to manage order
    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // find orders according to payment status ( for admin )
    app.get("/payfilter/:status", async (req, res) => {
      const status = req.params.status;
      const query = { status: status };
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // update role to make admin   add jwt
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedItem = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: updatedItem.role,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {
        expiresIn: "24h",
      });
      res.send({ result, token });
    });
    //  update order status for admin to manage orders
    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const updatedItem = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: updatedItem.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      //  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {expiresIn: '24h'});
      res.send({ result }); //add Token after the result
    });

    //  delete product from manage product modal
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });
    // get user according to email
    app.get("/user/:email", async (req, res) => {
      const e = req.params.email;
      const query = { email: e };
      const cursor = userCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // get profile according to email
    app.get("/profile/:email", async (req, res) => {
      const e = req.params.email;
      console.log(e);
      const query = { email: e };
      const cursor = profileCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // find data from orders my email to  show my orders
    app.get("/orders/:email", async (req, res) => {
      const e = req.params.email;

      console.log(e);
      const query = { email: e };
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      const token = jwt.sign({ email: e }, process.env.ACCESS_TOKEN, {
        expiresIn: "24h",
      });
      res.send({ result });
    });

    // // send user to database
    app.put("/users", async (req, res) => {
      const email = false;
      const user = req.body;
      console.log(user);
      if (email == 56) {
        const filter = { email: email };
        const option = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(
          filter,
          updateDoc,
          option
        );
        res.send(user);
      }
    });

    // put user to db from signup
    app.put("/profile/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await profileCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(result);
    });

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
    app.post("/userss", async (req, res) => {
      const info = req.body;
      console.log(info);

      const x = {
        lol: "lol",
      };

      if ((x = 0)) {
        const result = await userCollection.insertOne(x);
        res.send(result);
      } else {
        res.send({ messege: "from back end" });
      }
    });
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    // to post a review
    app.post("/review", async (req, res) => {
      const fullReview = req.body;
      const result = await reviewCollection.insertOne(fullReview);
      res.send(result);
    });

    // find one by id
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);

      res.send(result);
    });

    // auth (jwt)
    app.post("/login", async (req, res) => {
      console.log("inside of login ");
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN);
      res.send({ token });
      console.log(token);
    });
  } finally {
  }
}

run().catch(console.dir());

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`all ok`);
});
