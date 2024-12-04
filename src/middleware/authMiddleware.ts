import { Request, Response, NextFunction } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyPassword } from '../utils';

const client = new MongoClient(process.env.MONGO_URL || '');

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { ownerId, ownerPassword } = req.body;

    if (!ownerId || !ownerPassword) {
        return res.status(400).json({ message: 'Middleware auth requires user id and password. Contact Support!' });
    }

    await client.connect();
    const database = client.db('superstudy');
    const userCollection = database.collection('users');

    const owner = await userCollection.findOne({ _id: new ObjectId(ownerId) });
    if (!owner) {
        return res.status(404).json({ message: 'Invalid UserID' });
    }

    const isPasswordValid = await verifyPassword(ownerPassword, owner.password);
    if (!isPasswordValid) {
        return res.status(403).json({ message: 'Invalid/Outdated Password' });
    }

    next();
};