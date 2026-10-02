// CODIGO PROPOSITALMENTE VULNERAVEL - apenas para fins didaticos (Aula 17 DevSecOps)
const express = require("express");
const { exec } = require("child_process");

const app = express();

// Command Injection: o parametro "host" vem do usuario e vai direto para o shell
// Ex.: /ping?host=8.8.8.8;cat /etc/passwd
app.get("/ping", (req, res) => {
  exec("ping -c 1 " + req.query.host, (err, stdout) => {
    res.send(stdout);
  });
});

// Code Injection: eval() executa qualquer JavaScript enviado pelo usuario
app.get("/calc", (req, res) => {
  const resultado = eval(req.query.expr);
  res.send(String(resultado));
});

app.listen(3000);
