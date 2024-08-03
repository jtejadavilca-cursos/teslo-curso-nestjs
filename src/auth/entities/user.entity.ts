import { IsBoolean, IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })   
    email: string;

    @Column('text', { select: false })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', { default: true })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user'],
    })
    roles: string[];

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }

    @BeforeUpdate()
    emailToLowerCaseOnUpdate() {
        this.emailToLowerCase();
    }
}
