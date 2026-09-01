import searchicon from "../../assets/SearchIcon.svg";
import bellring from "../../assets/bell-ring.svg";
import "./style.css";

export default function SearchNoti() {
    return (
        <div className="top-search">
            <div className="search">
                <img src={searchicon} />
                <input className="search-input" type="text" placeholder="Buscar documentos..." />
            </div>
            <div className="noti">
                <img src={bellring} />
            </div>
        </div>
    )
}