import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import connection from "./conn/conn.js";
import moment from "moment";

dotenv.config();

const conn = await connection();

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

app.post('/api/doc/resumir', upload.single('documento'), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const textoExtraido = pdfData.text.trim();
    await parser.destroy();

    if (!textoExtraido) {
      return res.status(400).json({ erro: 'PDF sem texto legível ou composto por imagens.' });
    }

    const systemPrompt = `Você é um analista especialista em documentos e conformidade contratual.

Regras de Classificação de Risco (avalie estritamente com base no contexto do documento):
- "Seguro": Cláusulas padrão, equilíbrio entre as partes, obrigações claras, conformidade com a legislação aplicável e ausência de penalidades desproporcionais ou responsabilidades ilimitadas.
- "Médio": Pequenas ambiguidades, prazos curtos, penalidades moderadas ou cláusulas que exigem atenção, mas que não representam ameaça jurídica ou financeira imediata e severa.
- "Alto": Cláusulas abusivas, ausência de limitação de responsabilidade, penalidades draconianas, rescisão unilateral sem justa causa, cessão indevida de dados/PI ou ilegalidades evidentes.

Regras de Saída:
1. Responda APENAS com um objeto JSON válido, sem qualquer texto adicional ou blocos de formatação markdown antes ou depois.
2. A propriedade "risk" DEVE ser estritamente uma destas três opções: "Alto", "Médio" ou "Seguro".
3. A propriedade "summary" deve conter um resumo conciso de até 3 frases destacando os fatores que justificam a classificação atribuída.

Estrutura EXATA do JSON:
{
  "summary": "Resumo de até 3 frases justificando o nível de risco atribuído.",
  "risk": "Seguro" | "Médio" | "Alto"
}`;


    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt} ${textoExtraido}`
    });

    const responseJsonReady = response.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const analise = JSON.parse(responseJsonReady);

    const reqFile = req.file;
    const riscoDb = analise.risk === "Seguro" ? "Baixo" : analise.risk;
    const sqlQuery = "INSERT INTO resumos_pdf (nome_arquivo, tamanho_bytes, risco, resumo) VALUES (?, ?, ?, ?)";

    try {
      await conn.promise().query(sqlQuery, [
        reqFile.originalname,
        reqFile.size,
        riscoDb,
        analise.summary
      ]);
    } catch (error) {
      console.log(error);
    }


    return res.status(200).json({
      success: {
        name: req.file.originalname,
        updated: "Atualizado agora",
        summary: analise.summary,
        risk: analise.risk
      }
    });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: 'Falha ao processar o PDF com a IA.' });
  }
});

app.get('/api/doc', async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM resumos_pdf ORDER BY id DESC";

    const [rows] = await conn.promise().query(sqlQuery);
    return res.status(200).json({ success: rows });
  } catch (error) {
    console.error('Erro: ', error);
    return res.status(500).json({ erro: "Falha ao receber documentos resumidos" });
  }
});



conn.connect((error) => {
  if (error) return console.log("erro: " + error);
  console.log("banco conectado");
})
app.listen(3000, () => console.log('Servidor rodando na porta 3000'));