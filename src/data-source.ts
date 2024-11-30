import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { InviteCode } from './entities/InviteCode';

export const AppDataSource = new DataSource({
    type: 'mongodb',
    url: process.env.MONGO_URL,
    database: 'superstudy',
    synchronize: true,
    entities: [User, InviteCode],
    useUnifiedTopology: true,
});