import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DisputeCase,
  DisputeStatus,
} from '../shared/entities/dispute-case.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../shared/audit-log.service';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(DisputeCase)
    private readonly disputeRepository: Repository<DisputeCase>,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async submitDispute(createDisputeDto: CreateDisputeDto, userId: number) {
    const parcel = await this.disputeRepository.manager.findOne('LandParcel', {
      where: { id: createDisputeDto.parcelId },
    });
    if (!parcel) {
      throw new Error('Land parcel not found');
    }
    const complainant = await this.disputeRepository.manager.findOne('User', {
      where: { id: createDisputeDto.complainantId },
    });
    if (!complainant) {
      throw new Error('Complainant not found');
    }
    const dispute = this.disputeRepository.create({
      parcel,
      complainant,
      description: createDisputeDto.description,
      submissionDate: new Date(),
      supportingDocuments: createDisputeDto.supportingDocuments,
      status: DisputeStatus.OPEN,
    });
    const savedDispute = await this.disputeRepository.save(dispute);
    await this.notificationsService.sendNotification(
      'disputes',
      JSON.stringify({ type: 'dispute_submitted', disputeId: savedDispute.id }),
    );
    await this.auditLogService.logAction({
      entity: 'DisputeCase',
      entityId: savedDispute.id,
      action: 'DISPUTE_SUBMITTED',
      performedBy: userId,
      after: savedDispute,
    });
    return savedDispute;
  }

  async getDisputeById(id: number) {
    return this.disputeRepository.findOne({
      where: { id },
      relations: ['parcel', 'complainant'],
    });
  }
}
