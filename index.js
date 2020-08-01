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

app.post("/hotels", function (req, res) {
  const newHotelName = req.body.name;
  const newHotelRooms = req.body.rooms;
  const newHotelPostcode = req.body.postcode;

  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send("The number of rooms should be a positive integer.");
  }
  if (newHotelName == 0 || newHotelName == "") {
    return res.status(400).send("Please name your Hotel!");
  }
  if (newHotelRooms == 0 || newHotelRooms == "") {
    return res.status(400).send("A hotel with 0 rooms?");
  }
  const query =
    "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";

  pool
    .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An hotel with the same name already exists!");
      } else {
        const query =
          "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
        pool
          .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
          .then(() => res.send("Hotel created!"))
          .catch((e) => console.error(e));
      }
    });
});

app.delete("/hotels/:hotelsId", function (req, res) {
  const hotelsId = req.params.hotelsId;

  pool
    .query("DELETE FROM hotels WHERE id=$1", [hotelsId])
    .then(() => res.send(`Hotel ${hotelsId} deleted!`))
    .catch((e) => res.status(400).send("the hotel has bookings!"));
});
