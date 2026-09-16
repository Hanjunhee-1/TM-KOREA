import {
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { createEntityId } from '../../common/id/create-entity-id';

export abstract class UuidEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @BeforeInsert()
  assignId(): void {
    if (!this.id) {
      this.id = createEntityId();
    }
  }
}

export abstract class TimestampedEntity extends UuidEntity {
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt!: Date;
}

export abstract class SoftDeletableEntity extends TimestampedEntity {
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  deletedAt!: Date | null;
}
