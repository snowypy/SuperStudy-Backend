import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { validateApiKey, verifyPassword } from '../utils';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();
router.use(validateApiKey);

const client = new MongoClient(process.env.MONGO_URL || '');

router.post('/add', (req: Request, res: Response, next: NextFunction) => {
    const handler = async () => {
        const { emailOrUsername } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const usersCollection = database.collection('users');

        const user = await usersCollection.findOne({
            $or: [
                { username: emailOrUsername },
                { email: emailOrUsername }
            ]
        });
        if (!user) return res.status(400).json({ message: 'User not found' });

        await usersCollection.updateOne({ _id: user._id }, { $set: { isAdmin: true } });

        res.status(200).json({ message: 'User promoted to admin' });
    };
    handler().catch(next);
});

router.post('/create-invite', (req: Request, res: Response, next: NextFunction) => {
    const handler = async () => {
        const { adminId } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const usersCollection = database.collection('users');
        const inviteCodesCollection = database.collection('invitecodes');

        const admin = await usersCollection.findOne({ _id: new ObjectId(adminId), isAdmin: true });
        if (!admin) return res.status(401).json({ message: 'Unauthorized' });

        const inviteCode = { code: `INV-${Math.random().toString(36).substring(2, 8)}`, createdBy: admin.username, isUsed: false };
        await inviteCodesCollection.insertOne(inviteCode);

        res.status(201).json({ code: inviteCode.code });
    };
    handler().catch(next);
});

router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
    const handler = async () => {
        const { adminId, password } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const usersCollection = database.collection('users');

        const admin = await usersCollection.findOne({ _id: new ObjectId(adminId), isAdmin: true });
        if (!admin) return res.status(401).json({ message: 'Unauthorized' });

        const isPasswordValid = await verifyPassword(password, admin.password);
        if (!isPasswordValid) return res.status(403).json({ message: 'Invalid password' });

        const users = await usersCollection.find({}, { projection: { _id: 1, username: 1, email: 1 } }).toArray();
        res.status(200).json(users);
    };

    handler().catch(next);
});

export default router;