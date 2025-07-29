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
import { RabbitService } from 'src/shared/rabbit.service';
import { EventType } from 'src/shared/enums/EEvent-type.enum';

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
    private readonly rabbitService: RabbitService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async registerLand(createLandDto: CreateLandDto, userId: number) {
    const owner = await this.userRepository.findOne({
      where: { id: createLandDto.registeredOwnerId },
    });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    // Convert points array to WKT Polygon string
    const points = createLandDto.points;
    if (!points || points.length < 4) {
      throw new BadRequestException(
        'A polygon must have at least 4 points (first == last)',
      );
    }
    // Ensure the polygon is closed
    const first = points[0];
    const last = points[points.length - 1];
    if (
      first.longitude !== last.longitude ||
      first.latitude !== last.latitude
    ) {
      points.push({ ...first });
    }
    const polygonWkt = `POLYGON((${points.map((p) => `${p.longitude} ${p.latitude}`).join(', ')}))`;

    const existing = await this.landRepository
      .createQueryBuilder('land')
      .where(
        `ST_Intersects(
        land.location,
        ST_SetSRID(ST_GeomFromText(:polygon), 4326)
      )`,
      )
      .setParameter('polygon', polygonWkt)
      .getOne();

    if (existing) {
      throw new BadRequestException(
        'Land on this location already registered.',
      );
    }

    // Generate parcel number
    const parcelNumber = await this.generateUPI(createLandDto);

    const land = this.landRepository.create({
      ...createLandDto,
      parcelNumber,
      registeredOwner: owner,
    });

    // Insert with polygon geometry
    const savedLand = await this.landRepository
      .createQueryBuilder()
      .insert()
      .into(LandParcel)
      .values({
        ...land,
        location: () => `ST_SetSRID(ST_GeomFromText('${polygonWkt}'), 4326)`,
      })
      .execute();

    // Get the full saved entity
    const fullSavedLand = await this.landRepository.findOne({
      where: { id: savedLand.identifiers[0].id },
      relations: ['registeredOwner'],
    });

    // Publish events and notifications
    await this.rabbitService.publish(
      EventType.REGISTRATION,
      fullSavedLand!.parcelNumber,
    );
    await this.auditLogService.logAction({
      entity: 'LandParcel',
      entityId: fullSavedLand!.id,
      action: 'REGISTERED',
      performedBy: userId,
      after: fullSavedLand,
    });

    const [metrics] = await this.landRepository.query(
      `
        SELECT 
          ST_Area(ST_Transform(location, 3857)) AS area,
          ST_Perimeter(ST_Transform(location, 3857)) AS perimeter
        FROM land_parcel
        WHERE id = $1
      `,
      [fullSavedLand!.id],
    );

    // Update the entity with computed values
    await this.landRepository.update(fullSavedLand!.id, {
      area: metrics.area,
      perimeter: metrics.perimeter,
    });

    // Optionally, reload the entity
    const updatedLand = await this.landRepository.findOne({
      where: { id: fullSavedLand!.id },
      relations: ['registeredOwner'],
    });

    return updatedLand;
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
    await this.rabbitService.publish(
      EventType.TRANSFER,
      JSON.stringify(savedTransfer),
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

  generateUPI = async (dto: CreateLandDto): Promise<string> => {
    let upi: string = 'UPI-';
    // city
    // simulate upi generation per location 
    let isUnique = false;
    let attempts = 0;
    do {
      const rawUpi = Math.floor(10000000 + Math.random() * 90000000).toString();
      upi = rawUpi.match(/.{1,2}/g)?.join('/') ?? rawUpi;
      // Check uniqueness in the database
      const existing = await this.landRepository.findOne({
        where: { parcelNumber: upi },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
      if (attempts > 10) {
        throw new Error(
          'Failed to generate a unique UPI after multiple attempts',
        );
      }
    } while (!isUnique);
    return upi;
  };
}
