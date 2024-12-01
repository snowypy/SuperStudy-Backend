import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class Flashcard {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    courseId: ObjectId;

    @Column()
    title: string;

    @Column()
    type: 'info' | 'quiz';

    @Column({ nullable: true })
    data?: string;

    @Column({ nullable: true })
    question?: string;

    @Column({ nullable: true })
    answer?: string;

    constructor(courseId: ObjectId, title: string, type: 'info' | 'quiz', data?: string, question?: string, answer?: string) {
        this.id = new ObjectId();
        this.courseId = courseId;
        this.title = title;
        this.type = type;
        this.data = data;
        this.question = question;
        this.answer = answer;
    }
}