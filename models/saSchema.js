import mongoose from "mongoose";

const saSchema = new mongoose.Schema({
    SaFile: { type: String, require: true},
    storageUsed: { type: Number, require: true},
    storageLimit: { type: Number, require: true},
    storageFree: { type: Number, require: true},
    guildID: { type: String, require: true },
    SaJSON: { type: String, require: true }
});

export default mongoose.model("saSchema", saSchema);