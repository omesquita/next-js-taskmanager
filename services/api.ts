import axios, {Method} from "axios";

const client = axios.create({
    baseURL: "http://localhost:3000/api/",
    timeout: 3000
});

export const executeRequest = (endpoint: string, method: Method, body?: any) => {
    const headers = {'Content-Type': 'application/json'} as any;

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    console.log(`executando: ${endpoint}, metodo: ${method}, body: ${body}`);
    return client.request({
        url: endpoint,
        method,
        data: body ? body : "",
        headers
    });
}