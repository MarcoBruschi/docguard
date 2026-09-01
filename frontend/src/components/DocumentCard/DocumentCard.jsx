import "./style.css";

export default function DocumentCard({ name, updated, summary, risk }) {
    
    const getRiskVariant = (riskText) => {
        if (!riskText) return "risk-high";
        if (riskText === "Alto") return "risk-high";
        if (riskText === "Médio") return "risk-medium";
        if (riskText === "Seguro") return "risk-low";
    };

    const getRiskText = (riskText) => {
        if (!riskText) return "Risco Alto";
        if (riskText === "Alto") return "Risco Alto";
        if (riskText === "Médio") return "Risco Médio";
        if (riskText === "Seguro") return "Seguro";
    }

    const riskText = getRiskText(risk);
    const variant = getRiskVariant(risk);

    return (
        <div className={`document-card ${variant}`}>
            <div className="card-header">
                <div className="card-indicator"></div>
                <div className="card-header-info">
                    <div className="card-name" title={name}>{name}</div>
                    <div className="card-updated">{updated}</div>
                </div>
            </div>
            <div className="card-summary">{summary}</div>
            <div className="card-risk-badge">
                <span className="card-risk-text">{riskText}</span>
            </div>
        </div>
    );
}