import taskSchema from "../models/taskSchema.js";
import userProfiles from "../models/userProfiles.js";

const updateData = async (user, data) => {
    const profile = await userProfiles.findOneAndUpdate({ userID: user.id }, data);
    if (!profile) {
        await createDefaultProfile(user);
        await userProfiles.findOneAndUpdate({ userID: user.id }, data);
    }
};

const updateDataCustom = async (filter, data) => {
    const profile = await userProfiles.findOneAndUpdate(filter, data);
    if (!profile) {
        throw new Error("No Profile Found!");
    }
};

const findProfile = async (query) => {
    return await userProfiles.findOne(query);
};

const createDefaultProfile = async (user) => {
    return await userProfiles.create({
        userID: user.id,
        userName: user.username,
        useCount: 0,
        dailyUseCount: {
            givelink: 0,
            generate: 0
        },
        userServerPremiumExpiry: new Date(),
    });;
};

const addTask = async (user, msg_id, scene_json) => {
    return await taskSchema.create({
        user_id: user.id,
        task_msg_id: msg_id,
        scene_json: scene_json,
        time_added: new Date(),
        retries: 0,
        status: "Queued"
    });;
};

const updateTask = async (id, data) => {
    return await taskSchema.findOneAndUpdate({ task_msg_id: id }, data);
};

const listTasks = async () => {
    return await taskSchema.find({retries: {$lt: 3}}).sort({time_added : "ascending"});
};

const deleteTask = async (id) => {
    return await taskSchema.findOneAndDelete({ task_msg_id: id });
};

const deleteAllTasks = async () => {
    return await taskSchema.deleteMany({});
};

export {
    addTask, createDefaultProfile, deleteTask, findProfile, listTasks, updateData, updateDataCustom, updateTask, deleteAllTasks
};