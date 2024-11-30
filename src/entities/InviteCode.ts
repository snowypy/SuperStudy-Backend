import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class InviteCode {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    code: string;

    @Column({ default: false })
    isUsed: boolean;

    @Column()
    createdBy: string;

    constructor(code: string, createdBy: string, isUsed: boolean = false) {
        this.id = new ObjectId();
        this.code = code;
        this.isUsed = isUsed;
        this.createdBy = createdBy;
    }
}