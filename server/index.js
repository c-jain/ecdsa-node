const express = require("express");
const app = express();
const cors = require("cors");
const { ethers } = require("ethers");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {

};

const nonces = {

};

app.get("/account/:address", (req, res) => {
  const { address } = req.params;
  if (balances[address] === undefined) {
    balances[address] = 100;
    nonces[address] = 0;
  }
  const balance = balances[address];
  const nonce = nonces[address];
  res.send({ balance, nonce });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, nonce, sign } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const recoveredAddress = ethers.verifyMessage(JSON.stringify({ sender, recipient, amount, nonce }), sign);
  if (recoveredAddress.toLowerCase() !== sender.toLowerCase()) {
    res.status(400).send({ message: "Sender not verified!" });
  } else if (nonce < nonces[sender]) {
    res.status(400).send({ message: "Replay txn detected!" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    nonces[sender] += 1;
    res.send({ balance: balances[sender], nonce: nonces[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (balances[address] === undefined) {
    balances[address] = 100;
    nonces[address] = 0;
  }
}
