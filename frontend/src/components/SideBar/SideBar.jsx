import "./style.css";
import logo from "../../assets/DocGuardLogo.svg";

export default function SideBar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <div className="side-logo">
                    <img src={logo} alt="DocGuard logo" />
                    <span>Doc<span className="logo-span">Guard</span></span>
                </div>
            </div>
            <div className="side-profile">
                <div className="profile-picture">U</div>
                <div className="profile-about">
                    <div className="profile-name">User</div>
                    <div className="profile-role">Jurídico</div>
                </div>
            </div>
        </aside>
    );
}