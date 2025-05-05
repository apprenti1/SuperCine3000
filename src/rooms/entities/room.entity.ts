import { Screening } from 'src/screenings/screening.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array')
  images: string[];

  @Column()
  type: string;

  @Column()
  capacity: number;

  @Column({ default: false })
  handicapAccess: boolean;

  @Column({default:false})
  maintenance: boolean

  @OneToMany(() => Screening, screening => screening.room)
  screenings: Screening[]

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    images: string[],
    type: string,
    capacity: number,
    screenings: Screening[],
    handicapAccess: boolean = false,
    maintenance: boolean = false
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.images = images
    this.type = type
    this.capacity = capacity
    this.handicapAccess = handicapAccess
    this.maintenance = maintenance
    this.screenings = screenings
  }
}