import express, { Request, Response, NextFunction } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { AppDataSource } from '../data-source';
import { Course } from '../entities/Course';
import { Flashcard } from '../entities/Flashcard';
import { verifyPassword } from '../utils';
import { User } from '../entities/User';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();
const client = new MongoClient(process.env.MONGO_URL || '');

router.post('/:courseId/flashcard', async (req: Request, res: Response, next: NextFunction) => {
    await authMiddleware(req, res, next);
    const handler = async () => {
        const { courseId } = req.params;
        const { title, type, data, question, answer } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const flashcardCollection = database.collection('flashcards');

        let newFlashcard;

        if (type === 'info') {
            newFlashcard = new Flashcard(new ObjectId(courseId), title, type, data);
        } else if (type === 'quiz') {
            newFlashcard = new Flashcard(new ObjectId(courseId), title, type, undefined, question, answer);
        } else {
            return res.status(400).json({ message: 'Invalid flashcard type' });
        }

        await flashcardCollection.insertOne(newFlashcard);

        res.status(201).json({ message: 'Flashcard created successfully' });
    };
    handler().catch(next);
});

router.delete('/:courseId', async (req: Request, res: Response, next: NextFunction) => {
    await authMiddleware(req, res, next);
    const handler = async () => {
        const { courseId } = req.params;
        const { ownerId, password } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const courseCollection = database.collection('courses');
        const userCollection = database.collection('users');

        const owner = await userCollection.findOne({ _id: new ObjectId(ownerId) });
        if (!owner) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await verifyPassword(password, owner.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: 'Invalid password' });
        }

        const course = await courseCollection.findOne({ _id: new ObjectId(courseId), ownerId: new ObjectId(ownerId) });
        if (!course) {
            return res.status(404).json({ message: 'Course not found or you do not have permission to delete it' });
        }

        await courseCollection.deleteOne({ _id: new ObjectId(courseId) });

        res.status(200).json({ message: 'Course deleted successfully' });
    };

    handler().catch(next);
});

router.put('/:courseId', async (req: Request, res: Response, next: NextFunction) => {
    await authMiddleware(req, res, next);
    const handler = async () => {
        const { courseId } = req.params;
        const { title, description, visibility } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const courseCollection = database.collection('courses');

        const updatedCourse = await courseCollection.findOneAndUpdate(
            { _id: new ObjectId(courseId) },
            { $set: { title, description, visibility } },
            { returnDocument: 'after' }
        );

        if (!updatedCourse.value) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ message: 'Course updated successfully', course: updatedCourse.value });
    };
    handler().catch(next);
});

router.put('/:courseId/flashcard/:flashcardId', async (req: Request, res: Response, next: NextFunction) => {
    await authMiddleware(req, res, next);
    const handler = async () => {
        const { courseId, flashcardId } = req.params;
        const { title, type, data, question, answer } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const flashcardCollection = database.collection('flashcards');

        const updatedFlashcard = await flashcardCollection.findOneAndUpdate(
            { _id: new ObjectId(flashcardId), courseId: new ObjectId(courseId) },
            { $set: { title, type, data, question, answer } },
            { returnDocument: 'after' }
        );

        if (!updatedFlashcard.value) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }

        res.status(200).json({ message: 'Flashcard updated successfully', flashcard: updatedFlashcard.value });
    };
    handler().catch(next);
});

router.delete('/:courseId/flashcard/:flashcardId', async (req: Request, res: Response, next: NextFunction) => {
    await authMiddleware(req, res, next);
    const handler = async () => {
        const { courseId, flashcardId } = req.params;
        const { ownerId, password } = req.body;

        await client.connect();
        const database = client.db('superstudy');
        const flashcardCollection = database.collection('flashcards');
        const userCollection = database.collection('users');

        const owner = await userCollection.findOne({ _id: new ObjectId(ownerId) });
        if (!owner) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await verifyPassword(password, owner.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: 'Invalid password' });
        }

        const flashcard = await flashcardCollection.findOne({ _id: new ObjectId(flashcardId), courseId: new ObjectId(courseId) });
        if (!flashcard) {
            return res.status(404).json({ message: 'Flashcard not found or you do not have permission to delete it' });
        }

        await flashcardCollection.deleteOne({ _id: new ObjectId(flashcardId) });

        res.status(200).json({ message: 'Flashcard deleted successfully' });
    };

    handler().catch(next);
});

export default router;