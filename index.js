const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", (req, res) => {
  console.log("a client connected to the endpoint /");
  res.send("Hello SQL!");
});

app.listen(port, () =>
  console.log(
    `Server is listening on port 3000. Ready to accept requests (use /):${port}`
  )
);

const { Pool } = require("pg");

const pool = new Pool({
  user: "ion",
  host: "localhost",
  database: "cyf_ecommerce",
  password: "Qb1p5d.3t",
  port: 5432,
});

app.get("/products", function (req, res) {
  pool.query("SELECT * FROM products", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/suppliers", function (req, res) {
  pool.query("SELECT * FROM suppliers", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/customers/:customersId", function (req, res) {
  const customersId = req.params.customersId;
  if (customersId == 0 || customersId == "") {
    return res.status(400).send("Please enter an ID!");
  }
  pool
    .query("SELECT * FROM customers WHERE id=$1", [customersId])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.post("/customers", function (req, res) {
  const newCustomerName = req.body.name;
  const newCustomerAddress = req.body.address;
  const newCustomerCity = req.body.city;

  if (newCustomerName == 0 || newCustomerName == "") {
    return res.status(400).send("Please name your Hotel!");
  }
  if (newCustomerAddress == 0 || newHotelRooms == "") {
    return res.status(400).send("No address");
  }
  const query =
    "INSERT INTO customers (name, address, city) VALUES ($1, $2, $3)";

  pool
    .query("SELECT * FROM customers WHERE name=$1", [newCustomerName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("A customer with the same name already exists!");
      } else {
        const query =
          "INSERT INTO customers (name, address, city) VALUES ($1, $2, $3)";
        pool
          .query(query, [newCustomerName, newCustomerAddress, newCustomerCity])
          .then(() => res.send("Customer created!"))
          .catch((e) => console.error(e));
      }
    });
});

app.delete("/customers/:customersId", function (req, res) {
  const customersId = req.params.customersId;

  pool
    .query("DELETE FROM customers WHERE id=$1", [customersId])
    .then(() => res.send(`Customer ${customersId} deleted!`))
    .catch((e) => res.status(400).send("The customer can't be deleted!"));
});
