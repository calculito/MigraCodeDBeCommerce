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

app.get("/products/:productName", function (req, res) {
  const productName = req.params.productName;
  pool
    .query(
      "select product_name,supplier_name from products join suppliers on products.supplier_id = suppliers.id  where products.product_name like $1",
      [`%${productName}%`]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.get("/suppliers", function (req, res) {
  pool.query("SELECT * FROM suppliers", (error, result) => {
    res.json(result.rows);
  });
});
app.get("/customers2", function (req, res) {
  pool.query(
    `"SELECT * 
  FROM customers"`,
    (error, result) => {
      res.json(result.rows);
    }
  );
});

app.get("/customers/:customersCity", function (req, res) {
  const customersCity = req.params.customersCity;
  if (customersCity == 0 || customersCity == "") {
    return res.status(400).send("Please enter a city!");
  }
  pool
    .query("SELECT * FROM customers WHERE city like $1", [`%${customersCity}%`])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.post("/customers", function (req, res) {
  const newCustomerName = req.body.name;
  const newCustomerAddress = req.body.address;
  const newCustomerCity = req.body.city;

  if (newCustomerName == 0 || newCustomerName == "") {
    return res.status(400).send("Please name your customer!");
  }
  if (newCustomerAddress == 0 || newCustomerAddress == "") {
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
          .then(() => res.status(201).send("Customer created!"))
          .catch((e) => console.error(e));
      }
    });
});

app.post("/products", function (req, res) {
  const newProductName = req.body.name;
  const newProducePrice = req.body.price;
  const newSupplierId = req.body.id;

  if (newProductName == 0 || newCustomerName == "") {
    return res.status(400).send("Please name your product!");
  }
  if (newProducePrice == 0 || newProducePrice == "") {
    return res.status(400).send("No price");
  }
  const query =
    "INSERT INTO products (name, price, supplier_id) VALUES ($1, $2, $3)";

  pool
    .query("SELECT * FROM products WHERE name=$1", [newProductName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("A product with the same name already exists!");
      } else {
        const query =
          "INSERT INTO products (name, price, supplier_id) VALUES ($1, $2, $3)";
        pool
          .query(query, [newProductName, newProducePrice, newSupplierId])
          .then(() => res.send("Product created!"))
          .catch((e) => console.error(e));
      }
    });
});

app.post("/customers/:customerId/orders", function (req, res) {
  let customerId = req.params.customerId;
  let { orderDate, orderReference } = req.body;

  pool
    .query("SELECT * FROM customers c WHERE c.id = $1", [customerId])
    .then((result) => {
      if (result.rowCount > 0) {
        pool
          .query(
            "INSERT INTO orders (order_date, order_reference, customer_id) VALUES ($1, $2, $3)",
            [orderDate, orderReference, customerId]
          )
          .then((secondResult) =>
            res.status(201).send(`order created for customer ${customerId}`)
          )
          .catch((error) => {
            console.log(error);
            res.status(500).send("could not save the order :( ...");
          });
      } else {
        return res.status(400).send(`customer with id ${customerId} NOT FOUND`);
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

app.delete("/customers/:customersId", function (req, res) {
  const customersId = req.params.customersId;

  pool
    .query("DELETE FROM customers WHERE id=$1", [customersId])
    .then(() => res.send(`Customer ${customersId} deleted!`))
    .catch((e) => res.status(400).send("The customer can't be deleted!"));
});

app.delete("/customers/:customersName", function (req, res) {
  const customersName = req.params.name;

  pool
    .query("DELETE FROM customers WHERE name = 'John Doe'", [customersName])
    .then(() => res.send(`Customer ${customersName} deleted!`))
    .catch((e) => res.status(400).send("The customer can't be deleted!"));
});

app.put("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const newEmail = req.body.email;

  pool
    .query("UPDATE customers SET email=$1 WHERE id=$2", [newEmail, customerId])
    .then(() => res.send(`Customer ${customerId} updated!`))
    .catch((e) => console.error(e));
});

app.get("/customers/:customerId/orders", function (req, res) {
  const customerId = req.params.customerId;
  const query = `SELECT 
  customers.name,
  orders.order_reference,
  orders.order_date,
  products.product_name,
  products.unit_price,
  suppliers.supplier_name,
  suppliers.country,
  order_items.quantity
  FROM customers
  INNER JOIN orders ON customer_id = customers.id
  INNER JOIN order_items ON order_id = orders.id
  INNER JOIN products ON products.id = order_items.product_id
  INNER JOIN suppliers ON suppliers.id = products.supplier_id
  WHERE customers.id = $1`;

  pool
    .query(query, [customerId])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});
