import express from "express";
import cors from "cors";
import { extractText } from "unpdf";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());

app.post("/api/doc", async (req, res) => {
  try {
    const file = req.body.file;
    if (!file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const buffer = Buffer.from(file, "base64");
    let extractedText = "";

    try {
      const pdfData = await extractText(new Uint8Array(buffer), { mergePages: true });
      extractedText = Array.isArray(pdfData.text) ? pdfData.text.join("\n") : (pdfData.text || "");
    } catch (pdfErr) {
      console.warn("Falha ao extrair texto como PDF, tentando texto puro:", pdfErr.message);
      extractedText = buffer.toString("utf8");
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ error: "Não foi possível extrair texto do documento ou o documento está vazio." });
    }

    const systemPrompt = `Você é um analista de documentos. Regras absolutas: 1. Responda APENAS com um objeto JSON válido. 2. Não adicione nenhum texto antes ou depois do JSON. A propriedade 'urgencia' deve ser um número inteiro (1, 2 ou 3). Estrutura EXATA do JSON: { "resumo": "Resumo em até 3 linhas.", "urgencia": 1, "prazos": [ { "data": "Data/período", "descricao": "O que acontece" } ] }`;

    let respostaOllama;
    try {
      respostaOllama = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen3",
          prompt: `Analise o seguinte documento: \n\n${extractedText}`,
          system: systemPrompt,
          stream: false,
          format: "json"
        })
      });
    } catch (fetchErr) {
      console.error("Erro ao conectar com Ollama:", fetchErr.message);
      return res.status(503).json({
        error: "Não foi possível conectar ao serviço Ollama (http://127.0.0.1:11434). Verifique se o Ollama está em execução ('ollama serve').",
        details: fetchErr.message
      });
    }

    if (!respostaOllama.ok) {
      const errText = await respostaOllama.text();
      return res.status(respostaOllama.status).json({
        error: `Erro retornado pelo Ollama (${respostaOllama.status})`,
        details: errText
      });
    }

    const data = await respostaOllama.json();

    let parsedResponse;
    try {
      let rawResponse = (data.response || "").trim();
      // Remover blocos de markdown caso o modelo os adicione
      if (rawResponse.startsWith("```json")) {
        rawResponse = rawResponse.substring(7);
        if (rawResponse.endsWith("```")) rawResponse = rawResponse.slice(0, -3);
      } else if (rawResponse.startsWith("```")) {
        rawResponse = rawResponse.substring(3);
        if (rawResponse.endsWith("```")) rawResponse = rawResponse.slice(0, -3);
      }

      parsedResponse = JSON.parse(rawResponse.trim());
    } catch (error) {
      console.error("Erro ao fazer parse do JSON:", error.message);
      console.error("Resposta crua do Ollama:", data.response);
      return res.status(500).json({ error: "O modelo retornou um JSON inválido.", rawResponse: data.response });
    }

    return res.status(200).json({ success: true, ...parsedResponse });
  } catch (err) {
    console.error("Erro interno no servidor:", err);
    return res.status(500).json({ error: "Erro interno do servidor.", details: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));