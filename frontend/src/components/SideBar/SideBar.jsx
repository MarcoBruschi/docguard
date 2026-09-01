import "./style.css";
import logo from "../../assets/DocGuardLogo.svg";

export default function SideBar() {
    return (
        <div className="sidebar">
            <div className="side-logo"><img src={logo} alt="DocGuard logo" />Doc<span className="logo-span">Guard</span></div>
            <div className="side-profile">
                <div className="profile-picture">U</div>
                <div className="profile-about">
                    <div className="profile-name">User</div>
                    <div className="profile-role">Jurídico</div>
                </div>
            </div>
        </div>
    )
}