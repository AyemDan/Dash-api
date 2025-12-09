import { Admin } from '../models/Admin';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

function escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


export async function login(req, res) {

    const { nameId, password } = req.body;
    if ((!nameId) || !password) return res.status(400).json({ message: 'email or nameId and password required' });

    let admin;
    if (nameId) {
        const escaped = escapeRegex(nameId as string);
        const re = new RegExp(`^${escaped}$`, 'i');
        admin = await Admin.findOne({ name: re }).exec();
    }
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const hash = (admin as any).passwordHash || (admin as any).password;
    if (!hash) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ sub: (admin as any)._id, role: (admin as any).role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
    res.json({ token, admin: { id: (admin as any)._id, email: (admin as any).email, role: (admin as any).role, nameId: (admin as any).name } });
}
