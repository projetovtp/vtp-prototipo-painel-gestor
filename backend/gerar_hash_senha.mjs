// gerar_hash_senha.js
import bcrypt from "bcryptjs";

const senha = process.argv[2];

if (!senha) {
  console.log('Uso: node gerar_hash_senha.js "SUA_SENHA"');
  process.exit(1);
}

const hash = bcrypt.hashSync(senha, 10);

console.log("=================================");
console.log("Senha em texto:", senha);
console.log("Hash gerado (cole no banco):");
console.log(hash);
console.log("=================================");
