import {NextPage} from "next";

type FooterProps = {
    showModal(): void
}


const Footer: NextPage<FooterProps> = ({showModal}) => {
    return (
        <div className="container-footer">
            <button onClick={showModal}><img src="/add.svg" alt="Adicionar Tarefa"/> Adicionar Tarefa</button>
            <span>© Copyright {new Date().getFullYear()}. Todos os direitos reservados.</span>
        </div>
    );
}

export {Footer}