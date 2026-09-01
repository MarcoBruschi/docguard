import "./style.css";
import searchicon from "../../assets/SearchIcon.svg";
import bellring from "../../assets/bell-ring.svg";
import databaseIcon from "../../assets/database-backupIcon.svg";

export default function Home() {
    return (
        <div className="homepage">
            <div className="top">
                <div className="top-title">
                    <div className="title-title">Painel de Análise</div>
                    <div className="title-subtitle">Monitore a conformidade e riscos dos seus textos.</div>
                </div>
                <div className="top-search">
                    <div className="search">
                        <img src={searchicon} />
                        <input className="search-input" type="text" placeholder="Buscar documentos..." />
                    </div>
                    <div className="noti">
                        <img src={bellring} />
                    </div>
                </div>
            </div>
            <div className="middle">
                <img src={databaseIcon} />
                <div className="middle-text">Arraste seus contratos ou textos aqui</div>
                <div className="sub-text">
                    ou <label htmlFor="file-upload" className="file-label">selecione um arquivo</label>
                    <input id="file-upload" className="file-input" type="file" accept=".pdf" />
                </div>
            </div>
        </div>
    )
}