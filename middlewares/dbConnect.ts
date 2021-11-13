import type {NextApiRequest, NextApiResponse, NextApiHandler} from "next";
import * as mongoose from "mongoose";
import {HttpStatusCode} from "../core.netowork/HttpStatusCode";

const dbConnect = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    //validate if database is connected
    if (mongoose.connections[0].readyState) {
        return handler(req, res)
    }

    const {DB_CONNECTION_STRING} = process.env;
    if (!DB_CONNECTION_STRING) {
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({error: "environment DB_CONNECTION_STRING don't defined!"})
    }

    await mongoose.connect(DB_CONNECTION_STRING)
    mongoose.connection.on("connected", () => console.log("Database successful connected!"))
    mongoose.connection.on("error", error => console.log("Failed to connect database: " + error))
    return handler(req, res)
}
export {dbConnect}