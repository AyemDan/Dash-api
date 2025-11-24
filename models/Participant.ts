import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    fullName: { type: String},
    email: { type: String, required: true, unique: true },
    phone: String,
    division: String,
    parish: String,
    deanery: String,
    modules: [{
        module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
        enrolledAt: { type: Date, default: Date.now },
        grades: [{
            name: String,
            score: Number,
            maxScore: Number,
            date: Date
        }],
        finalScore: Number,
        gradePoint: Number,
        gradeLetter: String,
        status: { type: String, enum: ['Registered', 'In Progress', 'Completed', 'dropped'], default: 'enrolled' }
    }],
    enrolledPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
    status: { type: String, enum: ['active', 'inactive', 'graduated'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdAt: { type: Date, default: Date.now }
});

participantSchema.pre('save', function (next) {
    // Calculate grade points for each module if finalScore is present
    if (this.modules && this.modules.length > 0) {
        this.modules.forEach(m => {
            if (m.finalScore != null) {
                const score = m.finalScore;
                if (score >= 80) {
                    m.gradeLetter = 'A';
                    m.gradePoint = 4.0;
                } else if (score >= 70) {
                    m.gradeLetter = 'B';
                    m.gradePoint = 3.0;
                } else if (score >= 60) {
                    m.gradeLetter = 'C';
                    m.gradePoint = 2.0;
                } else if (score >= 50) {
                    m.gradeLetter = 'D';
                    m.gradePoint = 1.0;
                } else {
                    m.gradeLetter = 'F';
                    m.gradePoint = 0.0;
                }
            }
        });
    }
    next();
});

export const Participant = mongoose.model('Participant', participantSchema);