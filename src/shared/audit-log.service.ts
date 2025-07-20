import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(params: {
    entity: string;
    entityId: number;
    action: string;
    performedBy: number;
    before?: any;
    after?: any;
  }) {
    const log = this.auditLogRepository.create({
      ...params,
      performedAt: new Date(),
    });
    return this.auditLogRepository.save(log);
  }
}
