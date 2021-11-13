import {useState} from "react";
import {executeRequest} from "../services/api";
import {NextPage} from "next";
import {AccessTokenProps} from "../types/AccessTokenProps";

type LoginProps = {
    setToken(e: string): void
    setToRegister(e: boolean): void
}

export const Login: NextPage<LoginProps> = ({setToken, setToRegister}) => {

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setLoading] = useState(false);

    const doLogin = async () => {
        try {
            setLoading(true)
            if (!login && !password) {
                setError('Favor informar email e senha');
                setLoading(false)
                return
            }

            const body = {
                login,
                password
            }

            const result = await executeRequest('login', 'POST', body);
            if (result && result.data) {
                const token = result.data.token
                console.log(`accesstoken: ${token}`)

                localStorage.setItem('accessToken', result.data.token);
                localStorage.setItem('userName', result.data.name);
                localStorage.setItem('userMail', result.data.mail);
                setToken(token);
            } else {
                setError('Não foi possível processar o login. Tente novamente');
            }
        } catch (e: any) {
            console.log(e)
            if (e?.response?.data?.error) {
                setError(e?.response?.data?.error);
            } else {
                setError('Não foi possivel processar login, tente novamente');
            }
        }

        setLoading(false)
    }

    return (
        <div className="container-login">
            <img src="/logo.svg" alt="Logo Fiap" className="logo"/>
            <form>
                <p className="error">{error}</p>
                <div className="input">
                    <img src="/mail.svg" alt="Informe seu email"/>
                    <input type="text"
                           placeholder="Informe seu email"
                           value={login}
                           onChange={event => setLogin(event.target.value)}
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
                        onClick={doLogin}
                        className={isLoading ? 'loading' : ''}
                        disabled={isLoading}>
                    {isLoading ? '...Carregando' : 'Login'}
                </button>

                <p className="registerMessage"
                   onClick={() => setToRegister(true)}
                >
                    Ainda não tem cadastro? <span>Registre-se.</span>
                </p>
            </form>
        </div>
    )
}