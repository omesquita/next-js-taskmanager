import type {NextApiRequest, NextApiResponse} from "next";
import {DefaultResponse} from "../../types/DefaultResponse";
import {Task} from "../../types/Task";
import {TaskModel} from "../../models/TaskModel";
import {TaskRequest} from "../../types/TaskRequest";
import {GetTasksRequest} from "../../types/GetTasksRequest";
import {jwtValidator} from "../../middlewares/jwtValidator";
import {corsPolicy} from "../../middlewares/corsPolicy";
import {dbConnect} from "../../middlewares/dbConnect";


const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | Task[]>) => {
    try {
        let userId = req.body?.userId;
        if (!userId) {
            userId = req.query?.userId as string;
        }
        switch (req.method) {
            case "POST":
                return await saveTask(req, res, userId);
            case "PUT":
                return await updateTask(req, res, userId);
            case "DELETE":
                return await deleteTask(req, res, userId);
            case "GET":
                return await getTasks(req, res, userId);
            default:
                break;
        }

        return res.status(400).json({error: 'Method informed is not available.'});
    } catch (e) {
        console.log(e)
        res.status(500).json({error: "An error occurred at access tasks. Please, try again!"});
    }
}

const validateAndReturnTaskFound = async (req: NextApiRequest, userId: string | null | undefined) => {
    const taskId = req.query?.id as string;

    if (!userId) {
        return null;
    }

    if (!taskId || taskId.trim() === "") {
        return null;
    }

    const taskFound = await TaskModel.findById(taskId);
    if (!taskFound || taskFound.userId !== userId) {
        return null;
    }

    return taskFound;
}

const validateBody = (obj: TaskRequest, userId: string | null | undefined) => {
    if (!obj.name || obj.name.length < 3) {
        return '"Invalid task name.';
    }

    if (!userId) {
        return 'User not found.';
    }

    if (!obj.finishPrevisionDate) {
        return 'Prevision date not informed.';
    }
}

const saveTask = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>, userId: string | null | undefined) => {
    const taskRequest: TaskRequest = req.body;

    const msgValidation = validateBody(taskRequest, userId);
    if (msgValidation) {
        return res.status(400).json({error: msgValidation});
    }

    const task: Task = {
        userId: userId as string,
        name: taskRequest.name,
        finishPrevisionDate: taskRequest.finishPrevisionDate
    };

    await TaskModel.create(task);
    return res.status(200).json({message: "Task created with successful!"});
}

const updateTask = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>, userId: string | null | undefined) => {
    const task: Task = req.body;

    const taskFound = await validateAndReturnTaskFound(req, userId);
    if (!taskFound) {
        return res.status(400).json({error: "Task not found"});
    }

    const msgValidation = validateBody(task, userId);
    if (msgValidation) {
        return res.status(400).json({error: msgValidation});
    }

    taskFound.name = task.name;
    taskFound.finishPrevisionDate = task.finishPrevisionDate;
    taskFound.finishDate = task.finishDate;

    await TaskModel.findByIdAndUpdate({_id: taskFound._id}, taskFound);
    return res.status(200).json({message: "Task updated with successful!"});
}

const deleteTask = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>, userId: string | null | undefined) => {
    const taskFound = await validateAndReturnTaskFound(req, userId);
    if (!taskFound) {
        return res.status(400).json({error: "Task not found"});
    }

    await TaskModel.findByIdAndDelete({_id: taskFound._id});
    return res.status(200).json({message: "Task deleted with successful!"});
}

const getTasks = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | Task[]>, userId: string | null | undefined) => {
    const params: GetTasksRequest = req.query;

    const query = {
        userId
    } as any

    if (params?.finishPrevisionDateStart) {
        query.finishPrevisionDate = {$gte: params?.finishPrevisionDateStart}
    }

    if (params?.finishPrevisionDateEnd) {
        if (!params?.finishPrevisionDateStart) {
            query.finishPrevisionDate = {}
        }
        query.finishPrevisionDate.$lte = params?.finishPrevisionDateEnd
    }

    if (params?.status) {
        const status = parseInt(params.status);
        switch (status) {
            case 1:
                query.finishDate = null;
                break;
            case 2:
                query.finishDate = {$ne: null};
                break;
            default:
                break;
        }
    }

    const result = await TaskModel.find(query) as Task[];
    return res.status(200).json(result);
}

export default corsPolicy(dbConnect(jwtValidator(handler)));