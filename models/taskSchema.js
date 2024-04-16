import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    user_id: { type: String, require: true},
    task_msg_id: { type: String, require: true},
    scene_json: { type: String, require: true},
    time_added: { type: Date, require: true, default: new Date()},
    retries: { type: Number, default: 0, require: true},
    status: { type: String, require: true}
});

export default mongoose.model("taskSchema", taskSchema);