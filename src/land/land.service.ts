import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandParcel } from '../shared/entities/land-parcel.entity';
import { CreateLandDto } from './dto/create-land.dto';
import { TransferLandDto } from './dto/transfer-land.dto';
import { LandTransfer } from '../shared/entities/land-transfer.entity';
import { User } from '../shared/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../shared/audit-log.service';
import { TransferStatus } from '../shared/enums/ETransfer-status.enum';

@Injectable()
export class LandService {
  constructor(
    @InjectRepository(LandParcel)
    private readonly landRepository: Repository<LandParcel>,
    @InjectRepository(LandTransfer)
    private readonly transferRepository: Repository<LandTransfer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async registerLand(createLandDto: CreateLandDto, userId: number) {
    const owner = await this.userRepository.findOne({
      where: { id: createLandDto.registeredOwnerId },
    });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }
    // Check for duplicate parcel number
    const existing = await this.landRepository.findOne({
      where: { parcelNumber: createLandDto.parcelNumber },
    });
    if (existing) {
      throw new BadRequestException('Parcel number already exists');
    }
    const land = this.landRepository.create({
      ...createLandDto,
      registeredOwner: owner,
    });
    const savedLand = await this.landRepository.save(land);
    await this.notificationsService.sendNotification(
      'land',
      JSON.stringify({ type: 'land_registered', landId: savedLand.id }),
    );
    await this.auditLogService.logAction({
      entity: 'LandParcel',
      entityId: savedLand.id,
      action: 'REGISTERED',
      performedBy: userId,
      after: savedLand,
    });
    return savedLand;
  }

  async transferLand(transferLandDto: TransferLandDto, userId: number) {
    const parcel = await this.landRepository.findOne({
      where: { id: transferLandDto.parcelId },
      relations: ['registeredOwner'],
    });
    if (!parcel) {
      throw new NotFoundException('Land parcel not found');
    }
    if (parcel.registeredOwner.id !== transferLandDto.fromOwnerId) {
      throw new ForbiddenException(
        'Transfer initiator is not the current owner',
      );
    }
    const toOwner = await this.userRepository.findOne({
      where: { id: transferLandDto.toOwnerId },
    });
    if (!toOwner) {
      throw new NotFoundException('New owner not found');
    }
    const transfer = this.transferRepository.create({
      parcel,
      fromOwner: parcel.registeredOwner,
      toOwner,
      status: TransferStatus.PENDING,
      requestDate: new Date(),
      documents: transferLandDto.documents,
    });
    const savedTransfer = await this.transferRepository.save(transfer);
    await this.notificationsService.sendNotification(
      'land',
      JSON.stringify({
        type: 'land_transfer_initiated',
        transferId: savedTransfer.id,
      }),
    );
    await this.auditLogService.logAction({
      entity: 'LandTransfer',
      entityId: savedTransfer.id,
      action: 'TRANSFER_INITIATED',
      performedBy: userId,
      after: savedTransfer,
    });
    return savedTransfer;
  }

  async getLandById(id: number) {
    return this.landRepository.findOne({
      where: { id },
      relations: ['registeredOwner', 'history', 'permits', 'disputes'],
    });
  }
}
