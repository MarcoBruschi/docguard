import "./style.css";
import databaseIcon from "../../assets/database-backupIcon.svg";
import SearchNoti from "../../components/SearchNoti/SearchNoti.jsx";
import DocumentCard from "../../components/DocumentCard/DocumentCard.jsx";
import loadingIcon from "../../assets/loading.svg";

import { useRef, useState } from "react";

export default function Home() {

    const [fileList, setFileList] = useState([]);

    const uploadRef = useRef(null);
    const [file, setFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    const [isDragOver, setIsDragOver] = useState(false);

    const handleChange = () => {
        setFile(uploadRef.current.files[0]);
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        console.log("dragging");
        setIsDragOver(true);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        console.log("dropped");
        setFile(e.dataTransfer.files[0]);
        setIsDragOver(false);
    }

    const sendToAi = async (e) => {
        e.preventDefault();

        if (file === null) return;

        const formData = new FormData();
        formData.append('documento', file);

        setIsLoading(true);

        const response = await fetch("http://localhost:3000/api/doc/resumir", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        const parsed = typeof data.success === "string" ? JSON.parse(data.success) : data.success;
        const newCard = {
            name: file.name,
            updated: "Atualizado agora",
            summary: parsed.summary,
            risk: parsed.risk
        };
        setIsLoading(false);
        setFileList(prev => [...prev, newCard]);
        setFile(null);
    }

    const cancelAnalise = (e) => {
        e.preventDefault();
        setFile(null);
    }

    const renderCards = (cardList, risk) => {
        const data = cardList.filter(c => c.risk === risk);
        return data.map((d, index) => <DocumentCard key={index} name={d.name} updated={d.updated} summary={d.summary} risk={d.risk} />);
    }

    return (
        <div className="homepage">
            <div className="top">
                <div className="top-title">
                    <div className="title-title">Painel de Análise</div>
                    <div className="title-subtitle">Monitore a conformidade e riscos dos seus textos.</div>
                </div>
                <SearchNoti />
            </div>
            {isLoading === false ?
                <div className={`middle ${isDragOver ? "drag-over" : ""}`}
                    onClick={() => uploadRef.current.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragLeave={() => setIsDragOver(false)}
                    onDragEnd={() => setIsDragOver(false)}
                >
                    {file !== null ? <div>{file.name}</div> : <><img src={databaseIcon} />
                        <div className="middle-text">Arraste seus contratos ou textos aqui</div>
                        <div className="sub-text">
                            ou <label htmlFor="file-upload" className="file-label">selecione um arquivo</label>
                            <input id="file-upload" className="file-input" type="file" accept=".pdf" ref={uploadRef} onChange={handleChange} />
                        </div></>}
                </div>
                :
                <div className="middle-loading">
                    <img className="loadingIcon" src={loadingIcon} alt="ícone de carregamento" />
                </div>}
            {(file !== null && isLoading === false) ? <div className="analise"><button className="analise-button" onClick={sendToAi}>Analizar</button><button className="cancel-button" onClick={cancelAnalise}>Cancelar</button></div> : <></>}
            <div className="home-documents">
                <div className="home-documents-title">Documentos Recentes</div>
                {fileList.length === 0 ? <div className="">Nenhum documento encontrado, analize seus documentos.</div> : <>
                    <div className="home-documents-container">
                        <div className="documents-highrisk documents-risk">
                            <div className="highrisk-title risk-title">Urgente</div>
                            {fileList.length !== 0 ? renderCards(fileList, "Alto") : <></>}
                        </div>
                        <div className="documents-mediumrisk documents-risk">
                            <div className="mediumrisk-title">Atenção</div>
                            {fileList.length !== 0 ? renderCards(fileList, "Médio") : <></>}
                        </div>
                        <div className="documents-lowrisk documents-risk">
                            <div className="lowrisk-title">Sem Risco</div>
                            {fileList.length !== 0 ? renderCards(fileList, "Seguro") : <></>}
                        </div>
                    </div>
                </>}
            </div>
        </div>
    )
}