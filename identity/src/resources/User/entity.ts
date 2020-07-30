import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({
    unique: true,
  })
  public email: string;

  @Column({
    default: false,
  })
  public emailVerified: boolean;

  @Column({
    unique: true,
  })
  public phoneNumber: string;

  @Column({
    default: false,
  })
  public phoneNumberVerified: boolean;

  @Column()
  public givenName: string;

  @Column()
  public familyName: string;

  @Column({
    length: 8,
    nullable: true,
  })
  public locale?: string;

  @Column()
  public totpSecret: string;

  @Column()
  public totpRecovery: string;

  @CreateDateColumn()
  public readonly dateJoined: Date;

  @UpdateDateColumn()
  public readonly lastUpdated: Date;
}
