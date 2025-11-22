import { Participant } from '../models/Participant';
import { Module } from '../models/Module';
import mongoose from 'mongoose';

export async function createParticipant(req, res) {
    const { firstName, lastName, email, metadata } = req.body;
    if (!firstName && !lastName && !email) return res.status(400).json({ message: 'Provide at least a name or email' });
    const p = new Participant({ firstName, lastName, email, metadata });
    await p.save();
    res.status(201).json(p);
}

export async function getParticipant(req, res) {
    const p = await Participant.findById(req.params.id).populate('modules.module').lean();
    if (!p) return res.status(404).json({ message: 'Participant not found' });
    res.json({ participant: p });
}

export async function listParticipants(req, res) {
    const page = Math.max(parseInt(req.query.page as any) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as any) || 20, 1), 200);
    const q = (req.query.q as string) || '';
    const status = (req.query.status as string) || '';

    const filter: any = {};
    if (q) {
        const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ firstName: re }, { lastName: re }, { email: re }];
    }
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    // Always populate modules.module to show details since it's embedded now
    const query = Participant.find(filter).skip(skip).limit(limit).populate('modules.module');

    const [items, total] = await Promise.all([
        query.lean().exec(),
        Participant.countDocuments(filter).exec()
    ]);

    res.json({ page, limit, total, count: items.length, results: items });
}

export async function enrollParticipant(req, res) {
    const { participantId } = req.params;
    const { moduleIds } = req.body;
    if (!Array.isArray(moduleIds) || moduleIds.length === 0) return res.status(400).json({ message: 'moduleIds array required' });

    const participant = await Participant.findById(participantId);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    const modules = await Module.find({ _id: { $in: moduleIds } });
    if (modules.length !== moduleIds.length) return res.status(400).json({ message: 'One or more modules not found' });

    const results = [];
    for (const m of modules) {
        // Check if already enrolled
        const existing = participant.modules.find(mod => mod.module.toString() === m._id.toString());
        if (existing) {
            results.push({ module: m._id, status: 'skipped', reason: 'already enrolled' });
        } else {
            participant.modules.push({ module: m._id });
            results.push({ module: m._id, status: 'enrolled' });
        }
    }

    await participant.save();
    res.json({ results });
}

export async function addParticipantModuleGrade(req, res) {
    const { participantId, moduleId } = req.params;
    const { name, score, maxScore, date } = req.body;

    const participant = await Participant.findById(participantId);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    const moduleRecord = participant.modules.id(moduleId);
    if (!moduleRecord) return res.status(404).json({ message: 'Module record not found' });

    moduleRecord.grades.push({ name, score, maxScore, date: date ? new Date(date) : new Date() });
    await participant.save();
    res.status(201).json(moduleRecord);
}

export async function updateParticipantModule(req, res) {
    const { participantId, moduleId } = req.params;
    const { finalScore, status } = req.body;

    const participant = await Participant.findById(participantId);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    const moduleRecord = participant.modules.id(moduleId);
    if (!moduleRecord) return res.status(404).json({ message: 'Module record not found' });

    if (finalScore !== undefined) moduleRecord.finalScore = finalScore;
    if (status !== undefined) moduleRecord.status = status;

    await participant.save();
    res.json(moduleRecord);
}
