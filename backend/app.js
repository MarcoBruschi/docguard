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
      Regras absolutas:
      1. Responda APENAS com um objeto JSON válido, sem qualquer texto ou formatação markdown adicional antes ou depois.
      2. A propriedade 'risk' DEVE ser estritamente uma destas três opções (com a mesma capitalização e acentuação): "Alto", "Médio" ou "Seguro".
      3. A propriedade 'summary' deve ser um resumo conciso de até 3 frases destacando os principais riscos, cláusulas críticas ou a confirmação de conformidade.

      Estrutura EXATA do JSON:
      {
        "summary": "Resumo em até 3 frases destacando os pontos de atenção ou conformidade.",
        "risk": "Alto"
      }`;


    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt} ${textoExtraido}`
    });

    const responseJsonReady = response.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const analise = JSON.parse(responseJsonReady);

    const reqFile = req.file;

    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    const file = {
      nome_arquivo: reqFile.originalname,
      tamanho_bytes: reqFile.size,
      dados_ia: analise,
      criado_em: timestamp
    }

    const sqlQuery = "INSERT INTO resumos_pdf (nome_arquivo, tamanho_bytes, dados_ia, criado_em) VALUES (?, ?, ?, ?)";

    try {
      const [results, fields] = await conn.promise().query(sqlQuery, [
        file.nome_arquivo,
        file.tamanho_bytes,
        JSON.stringify(file.dados_ia),
        file.criado_em
      ]);
      
    } catch(error) {
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
conn.connect((error) => {
  if (error) return console.log("erro: " + error);
  console.log("banco conectado");
})
app.listen(3000, () => console.log('Servidor rodando na porta 3000'));