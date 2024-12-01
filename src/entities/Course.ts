import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class Course {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ default: true })
    visibility: boolean;

    @Column()
    ownerId: ObjectId;

    @Column({ type: 'array', default: [] })
    pendingUsers: string[];

    @Column({ type: 'array', default: [] })
    usersWithAccess: string[];

    constructor(title: string, description: string, ownerId: ObjectId, visibility: boolean = true) {
        this.id = new ObjectId();
        this.title = title;
        this.description = description;
        this.visibility = visibility;
        this.ownerId = ownerId;
        this.pendingUsers = [];
        this.usersWithAccess = [];
    }
}