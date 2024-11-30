import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { hashPassword, verifyPassword, generateToken, validateApiKey } from '../utils';

const router = express.Router();
router.use(validateApiKey);

const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl || (!mongoUrl.startsWith('mongodb://') && !mongoUrl.startsWith('mongodb+srv://'))) {
    throw new Error(`Invalid MongoDB connection string: ${mongoUrl}. Please check your MONGO_URL environment variable.`);
}

const client = new MongoClient(mongoUrl);



router.post('/new', (req: Request, res: Response, next: NextFunction) => {
    const handler = async () => {
        const { username, email, password, inviteCode } = req.body;

        if (username.length < 3 || username.length > 12) return res.status(400).json({ message: 'Invalid username' });
        if (!/\d/.test(password) || password.length < 5 || password.length > 24) return res.status(400).json({ message: 'Invalid password' });

        await client.connect();
        const database = client.db('superstudy');
        const usersCollection = database.collection('users');
        const inviteCodesCollection = database.collection('invitecodes');

        const existingUser = await usersCollection.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });
        if (existingUser) return res.status(400).json({ message: 'Username or email already taken' });

        let isAdmin = false;
        if (email === process.env.INITIAL_ADMIN_EMAIL) {
            isAdmin = true;
        } else {
            const invite = await inviteCodesCollection.findOne({ code: inviteCode, isUsed: false });
            if (!invite) return res.status(400).json({ message: 'Invalid or used invite code' });
            await inviteCodesCollection.updateOne({ _id: invite._id }, { $set: { isUsed: true } });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = { username, email, password: hashedPassword, isAdmin, registrationDate: new Date(), timeUsed: 0, flashcardsPlayed: 0 };
        await usersCollection.insertOne(newUser);

        res.status(201).json({ message: 'User registered successfully' });
    };

    handler().catch(next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    const handler = async () => {
        const { usernameOrEmail, password } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const usersCollection = database.collection('users');

        const user = await usersCollection.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(user._id.toString(), user.isAdmin);
        res.status(200).json({ token });
    };

    handler().catch(next);
});

router.post('/forgot-password', (req: Request, res: Response, next: NextFunction) => {
    const handler = async () => {
        const { email } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const usersCollection = database.collection('users');

        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email' });

        // [@TODO] Send password reset instructions to email
        res.status(200).json({ message: 'Password reset instructions sent to email' });
    };

    handler().catch(next);
});

router.get('/profile', (req: Request, res: Response, next: NextFunction) => {
    const handler = async () => {
        const { userId } = res.locals;
        await client.connect();
        const database = client.db('superstudy');
        const usersCollection = database.collection('users');

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });
        if (!user) return res.status(400).json({ message: 'User not found' });

        res.status(200).json(user);
    };

    handler().catch(next);
});

export default router;