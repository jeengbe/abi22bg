const axios = require("axios");
const fs = require("fs");
const users = JSON.parse(fs.readFileSync("a.json")).map(({ contacts: [u] }) => u);
const crypto = require("crypto");
const { aql, Database } = require("arangojs");
const db = new Database({
  url: "http://localhost:8529",
  databaseName: "abi22bg",
});

const passwords = [];

for (const user of users) {
  const username = user.profileUrl.split("/")[5];
  const password = crypto.randomBytes(4).toString("hex");
  passwords.push({ username, password });

  db.query(`
    INSERT {
      username: "${username}",
      password: "${crypto.createHash("sha256").update(password).digest("hex")}",
      name: "${user.fullName}",
      photo: "https://cloud.bg-schorndorf.de/index.php/avatar/${username}/720"
    } IN users
  `);
}

fs.writeFileSync("passwords.json", JSON.stringify(passwords, null, 2));
