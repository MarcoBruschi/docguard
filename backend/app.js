import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

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

    const systemPrompt = `Você é um analista de documentos. Regras absolutas: 1. Responda APENAS com um objeto JSON válido. 2. Não adicione nenhum texto antes ou depois do JSON. A propriedade 'urgencia' deve ser um número inteiro (1, 2 ou 3). Estrutura EXATA do JSON: { "resumo": "Resumo em até 3 linhas.", "urgencia": 1, "prazos": [ { "data": "Data/período", "descricao": "O que acontece" } ] }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt} ${textoExtraido}`
    });

    return res.status(200).json({ success: response.text });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: 'Falha ao processar o PDF com a IA.' });
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));