import type {NextApiRequest, NextApiResponse} from "next";
import md5 from "md5";
import jwt from 'jsonwebtoken'
import {User} from "../../types/User";
import {DefaultResponse} from "../../types/DefaultResponse";
import {UserModel} from "../../models/UserModel";
import {dbConnect} from "../../middlewares/dbConnect";
import {corsPolicy} from "../../middlewares/corsPolicy";

type LoginRequest = {
    login: string
    password: string
}

type LoginResponse = {
    name: string
    email: string
    token: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | LoginResponse>) => {
    try {
        if (req.method !== 'POST' || !req.body) {
            return res.status(400).json({error: 'Method informed is not available.'});
        }

        const {MY_SECRET_KEY} = process.env
        if (!MY_SECRET_KEY) {
            return res.status(500).json({error: "Environment MY_SECRET_KEY don't defined!"});
        }

        const loginRequest: LoginRequest = req.body

        if (loginRequest.login && loginRequest.password) {
            const userFound = await UserModel.find({email: loginRequest.login, password: md5(loginRequest.password)});
            if (userFound && userFound.length > 0) {
                const user: User = userFound[0]
                const token = jwt.sign({_id: user._id}, MY_SECRET_KEY);
                return res.status(200).json({name: user.name, email: user.email, token});
            } else {
                return res.status(400).json({error: "email not found or password invalid!"});
            }
        } else {
            return res.status(400).json({error: "login and password should be informed"});
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({error: "An error occurred at perform login. Please, try again!"});
    }
}

export default corsPolicy(dbConnect(handler));