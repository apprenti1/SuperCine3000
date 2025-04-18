import { Injectable, PipeTransform, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../entities/room.entity';

@Injectable()
export class ExistingRoomPipe implements PipeTransform {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async transform(value: any) {
    const id = value.id;
    const room = await this.roomsRepository.findOne({ where: { id } });
    
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    
    return value;
  }
}

@Injectable()
export class UniqueRoomPipe implements PipeTransform {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async transform(value: any) {
    const name = value.name;
    const room = await this.roomsRepository.findOne({ where: { name } });
    
    if (room) {
      throw new ConflictException(`Room with name ${name} already exists`);
    }
    
    return value;
  }
}