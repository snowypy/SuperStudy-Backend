import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { InviteCode } from './entities/InviteCode';
import { Flashcard } from './entities/Flashcard';
import { Course } from './entities/Course';

export const AppDataSource = new DataSource({
    type: 'mongodb',
    url: process.env.MONGO_URL,
    database: 'superstudy',
    synchronize: true,
    entities: [User, InviteCode, Flashcard, Course],
    useUnifiedTopology: true,
});