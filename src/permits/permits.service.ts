import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionPermit } from '../shared/entities/construction-permit.entity';
import { CreatePermitDto } from './dto/create-permit.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../shared/audit-log.service';
import { PermitStatus } from '../shared/enums/EPermit-status.enum';

@Injectable()
export class PermitsService {
  constructor(
    @InjectRepository(ConstructionPermit)
    private readonly permitRepository: Repository<ConstructionPermit>,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async applyPermit(createPermitDto: CreatePermitDto, userId: number) {
    const parcel = await this.permitRepository.manager.findOne('LandParcel', {
      where: { id: createPermitDto.parcelId },
    });
    if (!parcel) {
      throw new Error('Land parcel not found');
    }
    const applicant = await this.permitRepository.manager.findOne('User', {
      where: { id: createPermitDto.applicantId },
    });
    if (!applicant) {
      throw new Error('Applicant not found');
    }
    const permit = this.permitRepository.create({
      parcel,
      applicant,
      constructionType: createPermitDto.constructionType,
      plannedArea: createPermitDto.plannedArea,
      submissionDate: new Date(),
      documents: createPermitDto.documents,
      status: PermitStatus.DRAFT,
    });
    const savedPermit = await this.permitRepository.save(permit);
    await this.notificationsService.sendNotification(
      'permits',
      JSON.stringify({ type: 'permit_applied', permitId: savedPermit.id }),
    );
    await this.auditLogService.logAction({
      entity: 'ConstructionPermit',
      entityId: savedPermit.id,
      action: 'PERMIT_APPLIED',
      performedBy: userId,
      after: savedPermit,
    });
    return savedPermit;
  }

  async getPermitById(id: number) {
    return this.permitRepository.findOne({
      where: { id },
      relations: ['parcel', 'applicant'],
    });
  }
}
