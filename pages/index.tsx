import type {NextPage} from 'next'
import {useEffect, useState} from "react";
import {Login} from '../containers/Login'
import {Register} from '../containers/Register'
import {Home} from '../containers/Home'

const Index: NextPage = () => {
    const [accessToken, setToken] = useState('');
    const [toRegister, setToRegister] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            if (token) {
                setToken(token);
            }
        }
    }, []);

    let screen: any;

    if (accessToken) {
        screen = <Home setToken={setToken}/>
    } else {
        if (toRegister) {
            screen = <Register toRegister={setToRegister}/>
        } else {
            screen = <Login setToken={setToken} setToRegister={setToRegister}/>
        }
    }
    return screen;
}

export default Index