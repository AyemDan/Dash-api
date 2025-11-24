import { Module } from '../models/Module';
import { Program } from '../models/Program';
import mongoose from 'mongoose';

export async function listModules(req, res) {
    const query: any = {};
    if ((req.query as any).program) query.program = (req.query as any).program;
    const modules = await Module.find(query).populate('program').lean();
    res.json(modules);
}

export async function getModule(req, res) {
    const m = await Module.findById(req.params.id).populate('program');
    if (!m) return res.status(404).json({ message: 'Module not found' });
    res.json(m);
}

export async function createModule(req, res) {
    let { title, program, credits, isActive } = req.body;
    if (!title || !program) return res.status(400).json({ message: 'title and program required' });

    if (!mongoose.Types.ObjectId.isValid(program)) {
        const programDoc = await Program.findOne({ name: program });
        if (!programDoc) {
            return res.status(400).json({ message: `Program not found: ${program}` });
        }
        program = programDoc._id;
    }

    const code = generateModuleCode(title);

    const m = new Module({ title, program, credits, isActive, code });
    await m.save();
    res.status(201).json(m);
}


export async function deleteModule(req, res) {
    const m = await Module.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ message: 'Module not found' });
    res.json({ message: 'deleted' });
}

function generateModuleCode(title: string): string {
    const words = title.split(' ').filter(w => w.length > 0);
    const acronym = words.slice(0, 3).map(w => w[0].toUpperCase()).join('');

    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const year = now.getFullYear().toString().slice(-2);

    return `${acronym}${quarter}${year}`;
}