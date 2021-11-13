import type {NextApiRequest, NextApiResponse, NextApiHandler} from "next";
import jwt, {JwtPayload} from "jsonwebtoken";

const jwtValidator = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    const {MY_SECRET_KEY} = process.env;
    if (!MY_SECRET_KEY) {
        return res.status(500).json({error: "Environment MY_SECRET_KEY don't defined!"});
    }

    if (!req || !req.headers) {
        return res.status(401).json({error: "Was not possible validate access token"});
    }

    if (req.method !== "OPTIONS") {
        const authorization = req.headers["authorization"];
        if (!authorization) {
            return res.status(401).json({error: "Was not possible validate access token"});
        }

        const token = authorization.substr(7);
        if (!token) {
            return res.status(401).json({error: "Was not possible validate access token"});
        }

        try {
            const decodedToken = jwt.verify(token, MY_SECRET_KEY) as JwtPayload
            if (!decodedToken) {
                return res.status(401).json({error: "Was not possible validate access token"});
            }

            if (req.body) {
                req.body.userId = decodedToken._id
            } else if (req.query) {
                req.query.userId = decodedToken._id
            }
        } catch (e) {
            console.log(e)
            return res.status(500).json({error: "Was not possible validate access token. Please, try again!"});
        }
    }

    return handler(req, res)
}
export {jwtValidator}