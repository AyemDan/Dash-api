import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String },
    description: String,
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    credits: { type: Number, required: true, default: 3 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdAt: { type: Date, default: Date.now }
});

export const Module = mongoose.model('Module', moduleSchema);

