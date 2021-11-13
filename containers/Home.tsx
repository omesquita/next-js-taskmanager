import {NextPage} from "next";
import {AccessTokenProps} from "../types/AccessTokenProps";
import {Header} from "../components/Header";
import {Filter} from "../components/Filter";
import {Footer} from "../components/Footer";
import {List} from "../components/List";
import {useEffect, useState} from "react";
import {Task} from "../types/Task";
import {executeRequest} from "../services/api";
import {Modal} from "react-bootstrap";

const Home: NextPage<AccessTokenProps> = ({setToken}) => {

    const [tasks, setTasks] = useState<Task[]>([]);
    const [finishPrevisionDateStart, setFinishPrevisionDateStart] = useState('');
    const [finishPrevisionDateEnd, setFinishPrevisionDateEnd] = useState('');
    const [status, setStatus] = useState('0');

    const [showModal, setShowModal] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [msgError, setMsgError] = useState('');
    const [name, setName] = useState('');
    const [finishPrevisionDate, setFinishPrevisionDate] = useState('');

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userMail");
        setToken('')
    }

    const closeModal = () => {
        setName('');
        setFinishPrevisionDate('');
        setLoading(false);
        setMsgError('');
        setShowModal(false);
    }

    const doSave = async () => {
        try {
            setLoading(true)
            setMsgError('')
            if (!name && !finishPrevisionDate) {
                setMsgError('Favor informar nome e data de previsão da tarefa');
                setLoading(false)
                return
            }

            const body = {
                name,
                finishPrevisionDate
            }

            const result = await executeRequest('task', 'POST', body);
            if (result && result.data) {
                await getFilteredList()
                closeModal()
            } else {
                setMsgError('Não foi possível salvar. Tente novamente');
            }
        } catch (e: any) {
            console.log(e)
            if (e?.response?.data?.error) {
                setMsgError(e?.response?.data?.error);
            } else {
                setMsgError('Não foi possivel salvar. tente novamente');
            }
        }
        setLoading(false)
    }

    const getFilteredList = async () => {
        try {
            let query = `?status=${status}`;

            if (finishPrevisionDateStart) {
                query += `&finishPrevisionDateStart=${finishPrevisionDateStart}`;
            }

            if (finishPrevisionDateEnd) {
                query += `&finishPrevisionDateEnd=${finishPrevisionDateEnd}`;
            }

            const result = await executeRequest('task' + query, 'GET');
            if (result && result.data) {
                setTasks(result.data);
            }
        } catch (e: any) {
            console.log(e)
        }
    }

    useEffect(() => {
        getFilteredList();
    }, [finishPrevisionDateStart, finishPrevisionDateEnd, status]);

    return (
        <>
            <Header logout={logout} showModal={() => setShowModal(true)}/>
            <Filter
                finishPrevisionDateStart={finishPrevisionDateStart}
                finishPrevisionDateEnd={finishPrevisionDateEnd}
                status={status}
                setFinishPrevisionDateStart={setFinishPrevisionDateStart}
                setFinishPrevisionDateEnd={setFinishPrevisionDateEnd}
                setStatus={setStatus}
            />
            <List tasks={tasks} getFilteredList={getFilteredList}/>
            <Footer showModal={() => setShowModal(true)}/>
            <Modal show={showModal}
                   onHide={() => closeModal()}
                   className="container-modal">
                <Modal.Body>
                    <p>Adicionar uma tarefa</p>
                    {msgError && <p className="error">{msgError}</p>}
                    <input type="text"
                           placeholder="Nome da tarefa"
                           value={name}
                           onChange={e => setName(e.target.value)}/>
                    <input type="text"
                           placeholder="Data de previsão de conclusão"
                           value={finishPrevisionDate}
                           onChange={e => setFinishPrevisionDate(e.target.value)}
                           onFocus={e => e.target.type = "date"}
                           onBlur={e => finishPrevisionDate ? e.target.type = "date" : e.target.type = "text"}/>
                </Modal.Body>
                <Modal.Footer>
                    <div className="button col-12">
                        <button
                            onClick={doSave}
                            disabled={isLoading}
                        >{isLoading ? "...Enviando dados" : "Salvar"}</button>
                        <span onClick={closeModal}>Cancelar</span>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}
export {Home};