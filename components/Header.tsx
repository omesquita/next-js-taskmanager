import {NextPage} from "next";

type HeaderProps = {
    logout(): void,
    showModal(): void
}

const Header: NextPage<HeaderProps> = ({logout, showModal}) => {

    const fullName = localStorage.getItem("userName");
    const firstName = fullName?.split(' ')[0] || '';

    return (
        <div className="container-header">
            <img src="/logo.svg" alt="Logo Fiap" className="logo"/>

            <button onClick={showModal}><span>+</span> Adicionar Tarefa</button>

            <div className="mobile">
                <span>Ola {firstName}</span>
                <img src="/logout-mobile.svg" alt="Sair" className="logout" onClick={logout}/>
            </div>

            <div className="desktop">
                <span>Ola {firstName}</span>
                <img src="/logout-desktop.svg" alt="Sair" className="logout" onClick={logout}/>
            </div>
        </div>
    );
}

export {Header}