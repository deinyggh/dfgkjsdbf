import mongoose from "mongoose";

const bbScenes = new mongoose.Schema({
    id: { type: String, require: true},
    code: { type: String, require: true},
    date_added: { type: Date, require: true},
    title: { type: String, require: true},
    image: { type: String, require: true},
    url: { type: String, require: true },
    site: { type: String, require: true },
    posted: { type: Boolean, require: true }
});

export default mongoose.model("bbScenes", bbScenes);