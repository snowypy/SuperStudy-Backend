import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class User {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: false })
    isAdmin: boolean;

    @CreateDateColumn()
    registrationDate: Date;

    @Column({ default: 0 })
    timeUsed: number;

    @Column({ default: 0 })
    flashcardsPlayed: number;

    constructor() {
        this.id = new ObjectId();
        this.username = '';
        this.email = '';
        this.password = '';
        this.isAdmin = false;
        this.registrationDate = new Date();
        this.timeUsed = 0;
        this.flashcardsPlayed = 0;
    }
}