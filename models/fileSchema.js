import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    fileID: { type: String, require: true},
    SaFile: { type: String, require: true},
    guildID: { type: String, require: true},
    fileDeleteTime: { type: Date, require: true, default: new Date()},
});

export default mongoose.model("fileSchema", fileSchema);