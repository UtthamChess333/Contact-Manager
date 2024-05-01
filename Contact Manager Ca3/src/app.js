const fs = require("fs");
const path = require("path");
const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");

const app = express();
const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirectoryPath));
app.use(bodyParser.urlencoded({ extended: false }));

const data = [];
// Define routes
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/create", (req, res) => {
  const name = req.body.username;
  const phone = req.body.balance;
  const email = req.body.email;
  const note = req.body.note;

  let existingData = loadAccounts(); // Load existing data
  existingData.push({
    name: name,
    phone: phone,
    email: email,
    note: note,
  });

  saveAccounts(existingData);

  res.redirect("/list");
});

app.get("/delete", (req, res) => {
  res.render("delete");
});

app.get("/edit", (req, res) => {
  const accounts = loadAccounts(); // Load accounts data

  let selectedContact = null;
  if (req.query.contact) {
    selectedContact = accounts.find(
      (contact) => contact.id === req.query.contact
    );
  }

  res.render("edit", { contacts: accounts, selectedContact });
});

app.post("/select-contact", (req, res) => {
  const selectedContactId = req.body.contact;

  res.redirect(`/edit?contact=${selectedContactId}`);
});

app.post("/update/:id", (req, res) => {
  const id = req.params.id;
  const { username, phone, email, note } = req.body;

  let accounts = loadAccounts(); // Load accounts data

  // Find the index of the contact to edit
  const indexToEdit = accounts.findIndex((contact) => contact.id === id);

  if (indexToEdit !== -1) {
    // Update contact information
    accounts[indexToEdit] = {
      id: id,
      name: username,
      phone: phone,
      email: email,
      note: note,
    };

    // Save the updated contacts to the JSON file
    saveAccounts(accounts);

    res.redirect("/list"); // Redirect to the list page after editing contact
  } else {
    res.send("Contact not found");
  }
});

app.get("/list", (req, res) => {
  const accounts = loadAccounts();
  res.render("list", { accounts });
});

app.post("/delete", (req, res) => {
  const nameToDelete = req.body.username;

  let existingData = loadAccounts();

  const indexToRemove = existingData.findIndex(
    (contact) => contact.name === nameToDelete
  );

  if (indexToRemove !== -1) {
    existingData.splice(indexToRemove, 1);

    saveAccounts(existingData);

    res.redirect("/list");
  } else {
    res.send("Contact not found");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function loadAccounts() {
  try {
    const dataBuffer = fs.readFileSync(path.join(__dirname, "contacts.json"));
    const dataJSON = dataBuffer.toString();
    return JSON.parse(dataJSON);
  } catch (error) {
    return [];
  }
}

function saveAccounts(contacts) {
  const dataJSON = JSON.stringify(contacts);
  fs.writeFileSync(path.join(__dirname, "contacts.json"), dataJSON);
}
