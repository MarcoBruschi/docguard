const texto = `\`\`\`json
{
  "resumo": "Marcelo Augusto Ferreira teve sua conta de armazenamento digital bloqueada sem aviso prévio pela Empresa Fictícia de Serviços Digitais LTDA., impedindo o acesso a documentos profissionais.",
  "urgencia": 1,
  "prazos": [
    {
      "data": "28 de agosto de 2026",
      "descricao": "Contratação do serviço de armazenamento digital pelo Autor."
    }
  ]
}
\`\`\``;

const arrumado = texto.replace(/^```json\s*/, "").replace(/\s*```$/, "")

console.log(arrumado);