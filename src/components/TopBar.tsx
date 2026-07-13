import "./TopBar.css";

interface Props {
    onLogout: () => void;
}

export function TopBar({ onLogout }: Props) {
    return (
        <header className="topbar">
            <span className="topbar__brand">Gastos</span>
            <button className="topbar__logout" onClick={onLogout}>
                Sair
            </button>
        </header>
    );
}