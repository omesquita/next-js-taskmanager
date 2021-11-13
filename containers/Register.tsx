import {useState} from "react";
import {executeRequest} from "../services/api";
import {NextPage} from "next";

type RegisterProps = {
    toRegister(toRegister: boolean): void
}

export const Register: NextPage<RegisterProps> = ({toRegister}) => {

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setLoading] = useState(false);

    const doRegister = async () => {
        try {
            setLoading(true)
            setError('')
            if (!name && !email && !password) {
                setError('Favor informar nome, email e senha');
                setLoading(false)
                return
            }

            const body = {
                name,
                email,
                password
            }

            const result = await executeRequest('user', 'POST', body);
            if (result && result.data) {
                toRegister(false);
            } else {
                setError('Não foi possível cadastrar o usuario. Tente novamente');
            }
        } catch (e: any) {
            console.log(e)
            if (e?.response?.data?.error) {
                setError(e?.response?.data?.error);
            } else {
                setError('Não foi possivel cadastrar o usuario, tente novamente');
            }
        }

        setLoading(false)
    }

    return (
        <div className="container-register">
            <img src="/logo.svg" alt="Logo Fiap" className="logo"/>
            <form>

                <p className="register-title">Cadastre seu usuário</p>

                <p className="error">{error}</p>
                <div className="input">
                    <img src="/mail.svg" alt="Informe seu nome"/>
                    <input type="text"
                           placeholder="Informe seu nome"
                           value={name}
                           onChange={event => setName(event.target.value)}
                    />
                </div>
                <div className="input">
                    <img src="/mail.svg" alt="Informe seu email"/>
                    <input type="text"
                           placeholder="Informe seu email"
                           value={email}
                           onChange={event => setEmail(event.target.value)}
                    />
                </div>
                <div className="input">
                    <img src="/lock.svg" alt="Informe sua senha"/>
                    <input type="password"
                           placeholder="Informe sua senha"
                           value={password}
                           onChange={event => setPassword(event.target.value)}
                    />
                </div>
                <button type="button"
                        onClick={doRegister}
                        className={isLoading ? 'loading' : ''}
                        disabled={isLoading}>
                    {isLoading ? '...Carregando' : 'Cadastrar'}
                </button>

                <p className="backButton" onClick={() => toRegister(false)}>Voltar</p>
            </form>
        </div>
    )
}