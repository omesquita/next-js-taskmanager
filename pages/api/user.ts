import type {NextApiRequest, NextApiResponse} from "next";
import md5 from 'md5'
import {UserModel} from "../../models/UserModel";
import {User} from "../../types/User";
import {DefaultResponse} from "../../types/DefaultResponse";
import {dbConnect} from "../../middlewares/dbConnect";
import {corsPolicy} from "../../middlewares/corsPolicy";


class UserValidate {
    isValid: boolean
    message: string

    constructor(isValid: boolean, message: string) {
        this.isValid = isValid;
        this.message = message;
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {
    try {
        if (req.method !== 'POST' || !req.body) {
            return res.status(400).json({error: 'Method informed is not available.'})
        }

        const userRequest: User = req.body
        const validatedUser = validateUserRequest(userRequest)

        if (!validatedUser.isValid) {
            return res.status(400).json({error: validatedUser.message});
        }

        const userFound = await UserModel.find({email: userRequest.email});
        if (userFound && userFound.length > 0) {
            res.status(400).json({error: "User can't be created. Email " + userRequest.email + " already registered."});
        } else {
            userRequest.password = md5(userRequest.password)
            await UserModel.create(userRequest);
            res.status(200).json({message: "User created with successful!"});
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({error: "An error occurred at register user. Please, try again!"});
    }
}


function validateUserRequest(user: User): UserValidate {
    const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    if (!user.name || user.name.length < 2) {
        return new UserValidate(false, "Invalid user name!");
    } else if (!emailRegex.test(user.email)) {
        return new UserValidate(false, "Invalid email!");
    } else if (!user.password || user.password.length < 6) {
        return new UserValidate(false, "Invalid password!");
    } else {
        return new UserValidate(true, "");
    }
}

export default corsPolicy(dbConnect(handler));