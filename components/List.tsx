import {NextPage} from "next";
import {Task} from "../types/Task";
import {Item} from "./Item";
import {Modal} from "react-bootstrap";
import {executeRequest} from "../services/api";
import {useState} from "react";
import moment from 'moment'

type ListProps = {
    tasks: Task[],
    getFilteredList(): void
}

const List: NextPage<ListProps> = ({tasks, getFilteredList}) => {

    const [showModal, setShowModal] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [msgError, setMsgError] = useState('');

    const [_id, setId] = useState<string | undefined>('')
    const [name, setName] = useState('');
    const [finishPrevisionDate, setFinishPrevisionDate] = useState('');
    const [finishDate, setFinishDate] = useState('');

    const closeModal = () => {
        setName('');
        setFinishPrevisionDate('');
        setLoading(false);
        setMsgError('');
        setShowModal(false);
    }

    const doUpdate = async () => {
        try {
            setLoading(true)
            setMsgError('')

            if (!_id) {
                setMsgError('Tarefa invalida');
                setLoading(false)
                return
            }

            if (!name && !finishPrevisionDate) {
                setMsgError('Favor informar nome e data de previsão da tarefa');
                setLoading(false)
                return
            }

            const body: any = {
                name,
                finishPrevisionDate
            }

            if (finishDate) {
                body.finishDate = finishDate;
            }

            const result = await executeRequest(`task?id=${_id}`, 'PUT', body);
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

    const doDelete = async () => {
        try {
            setLoading(true)
            setMsgError('')

            if (!_id) {
                setMsgError('Tarefa invalida');
                setLoading(false)
                return
            }

            const result = await executeRequest(`task?id=${_id}`, 'DELETE');
            await getFilteredList()
            closeModal()
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

    const setTaskAndShow = (task: Task) => {
        setId(task._id);
        setName(task.name);
        setFinishDate(task.finishDate ? moment(task.finishDate).format('yyyy-MM-DD') : "");
        setFinishPrevisionDate(task.finishPrevisionDate ? moment(task.finishPrevisionDate).format('DD-MM-yyyy') : "");
        setShowModal(true);
    }

    return (<>
            <div className={'container-list' + (tasks && tasks.length > 0 ? '' : ' empty')}>
                {tasks && tasks.length > 0
                    ?
                    tasks.map((task, index) => <Item task={task} key={task._id} setTaskAndShow={setTaskAndShow}/>)
                    :
                    <>
                        <img src="/empty.svg" alt="Nenhuma tarefa encontrada"/>
                        <span>Voce ainda não possuí tarefas cadastradas!</span>
                    </>
                }
            </div>

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
                    <input type="text"
                           placeholder="Data de conclusão"
                           value={finishDate}
                           onChange={e => setFinishDate(e.target.value)}
                           onFocus={e => e.target.type = "date"}
                           onBlur={e => finishDate ? e.target.type = "date" : e.target.type = "text"}/>
                </Modal.Body>
                <Modal.Footer>
                    <div className="button col-12">
                        <button
                            onClick={doUpdate}
                            disabled={isLoading}
                        >{isLoading ? "...Enviando dados" : "Atualizar"}</button>
                        <span onClick={doDelete}>Excluir</span>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export {List}