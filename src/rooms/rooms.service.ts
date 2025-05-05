import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomRequest } from './validation/create-room.schema';
import { UpdateRoomRequest } from './validation/update-room.schema';
import { RoomId } from './validation/room-id.schema';
import { ListRoomsParam } from './validation/list-rooms.schema';
import { PaginationRequest } from 'src/common/validation/PaginationRequest';
import { Request } from 'express';
import { Roles } from 'src/common/enums/roles.enum';
import { ListingReturn } from 'src/common/interfaces/listing-return.interface';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async findAll(params: ListRoomsParam & PaginationRequest, req : Request) : Promise<ListingReturn<Room>> {
    // If the user isnt an admin they can't see rooms in maintenance
    if(req['user'].role === Roles.customer) params.maintenance = false

    const { page = 1, limit = 10, name, type, minCapacity, maxCapacity, handicapAccess, maintenance } = params;
    const skip = (page - 1) * limit;


    const where: FindOptionsWhere<Room> = {};

    if (name) {
      where.name = Like(`%${name}%`);
    }

    if (type) {
      where.type = type;
    }

    if (minCapacity && maxCapacity) {
      where.capacity = Between(minCapacity, maxCapacity);
    } else if (minCapacity) {
      where.capacity = MoreThanOrEqual(minCapacity);
    } else if (maxCapacity) {
      where.capacity = LessThanOrEqual(maxCapacity);
    }

    if (handicapAccess !== undefined) {
      where.handicapAccess = handicapAccess;
    }

    if (maintenance !== undefined) {
      where.maintenance = maintenance;
    }

    const [rooms, total] = await this.roomsRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { name: 'ASC' },
    })

    return {
      data: rooms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findById(params: RoomId, req : Request) {
    const room = await this.roomsRepository.findOneBy(
      req['user'].role === Roles.customer ?
      { id: params.id , maintenance: false}
      :
      { id: params.id }
    )

    if (!room) {
      throw new NotFoundException(`Room with ID ${params.id} not found`)
    }
    return room
  }

  async createRoom(data: CreateRoomRequest) {
    const room = this.roomsRepository.create(data);
    return this.roomsRepository.save(room);
  }

  async updateRoom(data: UpdateRoomRequest & RoomId) {
    const { id, ...updateData } = data;
    await this.roomsRepository.update(id, updateData);
    return this.roomsRepository.findOneBy({ id });
  }

  async deleteRoom(params: RoomId) {
    const room = await this.roomsRepository.findOneBy({ id: params.id });
    if (!room) {
      throw new NotFoundException(`Room with ID ${params.id} not found`); 
    }
    return await  this.roomsRepository.delete(room.id);
  }

  async seedRooms() {
    const rooms : CreateRoomRequest[] = [
      {
        name: 'Grand Écran',
        description: 'Notre plus grande salle avec écran IMAX et son Dolby Atmos',
        images: ['https://example.com/images/grand-ecran-1.jpg', 'https://example.com/images/grand-ecran-2.jpg'],
        type: 'IMAX',
        capacity: 300,
        handicapAccess: true,
      },
      {
        name: 'Salle Premium',
        description: 'Salle VIP avec fauteuils inclinables et service à la place',
        images: ['https://example.com/images/premium-1.jpg'],
        type: 'VIP',
        capacity: 50,
        handicapAccess: true,
      },
      // ... autres salles ...
      {
        name: 'Salle Privée',
        description: 'Salle disponible à la location pour événements privés',
        images: ['https://example.com/images/privee-1.jpg'],
        type: 'Événementiel',
        capacity: 40,
        handicapAccess: true,
      },
    ];

    for (const roomData of rooms) {
      const exists = await this.roomsRepository.findOneBy({ name: roomData.name });
      if (!exists) {
        const room = this.roomsRepository.create(roomData);
        await this.roomsRepository.save(room);
      }
    }

    return { message: '10 rooms have been seeded successfully' };
  }
}