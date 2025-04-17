import { allow } from 'joi';
import {
  Column,
  Model,
  Table,
  DataType,
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import {
  NigerianStates,
  NIGERIAN_STATES,
} from '../../../shared/utils/nigeria-states';
import { normalizeNigerianState } from '../../../shared/utils/nigeria-states-helpers';
import { normalizeEnumValue } from '../../../shared/utils/case-normalizer';
import { Col } from 'sequelize/types/utils';
import { Admin } from '../../admin/entities/admin.entity';
import { AdminActionLog } from '../../admin/entities/admin_action_log.entity';

// Create a GSM network enum for better type safety
export enum GsmNetwork {
  MTN = 'mtn',
  AIRTEL = 'airtel',
  GLO = 'glo',
  NINE_MOBILE = '9mobile',
}

// Create a Profession enum for better type safety
export enum Profession {
  COMMUNITY_PHARMACIST = 'community pharmacist',
  HOSPITAL_PHARMACIST = 'hospital pharmacist',
  ACADEMIC_PHARMACIST = 'academic pharmacist',
  ADMINISTRATIVE_PHARMACIST = 'administrative pharmacist',
  INDUSTRIAL_PHARMACIST = 'industrial pharmacist',
  COUNTER_ASSISTANT = 'counter assistant',
  PHARMACY_STUDENT = 'pharmacy studen',
  OTHERS = 'others',
}

export const GSM_NETWORKS = Object.values(GsmNetwork);
export const PROFESSIONS = Object.values(Profession);

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'first_name',
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'last_name',
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.ENUM('student', 'instructor', 'admin'),
    allowNull: false,
    defaultValue: 'student',
  })
  declare role: string;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: true,
    field: 'instructor_status',
  })
  declare instructorStatus: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_email_verified',
  })
  declare isEmailVerified: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'email_verification_token',
  })
  declare emailVerificationToken: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'email_verification_expires',
  })
  declare emailVerificationExpires: Date | null;

  @Column({
    type: DataType.ENUM(...GSM_NETWORKS),
    allowNull: false,
    field: 'gsm_network',
  })
  declare gsmNetwork: GsmNetwork;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'phone_number',
  })
  declare phoneNumber: string;

  @Column({
    type: DataType.ENUM(...NIGERIAN_STATES),
    allowNull: true,
  })
  declare state: NigerianStates;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'pcn_number',
  })
  declare pcnNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare country: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'place_of_work',
  })
  declare placeOfWork: string;

  @Column({
    type: DataType.ENUM(...PROFESSIONS),
    allowNull: false,
    field: 'professional_cadre',
  })
  declare professionalCadre: Profession;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare others: string;

  @Column({
    type: DataType.ENUM('active', 'suspended', 'pending_email_verification'),
    allowNull: false,
    defaultValue: 'pending_email_verification',
  })
  declare status: string;

  // New relationships
  @HasOne(() => Admin)
  declare admin: Admin;

  @HasMany(() => AdminActionLog, 'admin_user_id')
  declare adminActionLogs: AdminActionLog[];

  // Timestamps
  @Column({ field: 'created_at' })
  declare createdAt: Date;
  
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  /**
   * Normalizes input values before creating a new user
   */
  @BeforeCreate
  static normalizeInputValues(instance: User) {
    // Normalize state if it's a string input
    if (instance.state && typeof instance.state === 'string') {
      const normalizedState = normalizeNigerianState(instance.state);
      if (normalizedState) {
        instance.state = normalizedState;
      }
    }

    // Normalize GSM network (convert to lowercase)
    if (instance.gsmNetwork && typeof instance.gsmNetwork === 'string') {
      const normalizedNetwork = normalizeEnumValue(
        instance.gsmNetwork,
        GsmNetwork,
      );
      if (normalizedNetwork) {
        instance.gsmNetwork = normalizedNetwork;
      } else {
        // Default to lowercase if not found in enum (fallback)
        instance.gsmNetwork = instance.gsmNetwork.toLowerCase() as GsmNetwork;
      }
    }

    // Normalize professional cadre (convert to lowercase and match enum)
    if (instance.professionalCadre && typeof instance.professionalCadre === 'string') {
      const normalizedCadre = normalizeEnumValue(
        instance.professionalCadre,
        Profession,
      );
      if (normalizedCadre) {
        instance.professionalCadre = normalizedCadre;
      } else {
        // Default to lowercase if not found in enum (fallback)
        instance.professionalCadre = instance.professionalCadre.toLowerCase() as Profession;
      }
    }
  }

  /**
   * Normalizes input values before updating a user
   */
  @BeforeUpdate
  static normalizeUpdateValues(instance: User) {
    // Run the same normalization as in BeforeCreate
    User.normalizeInputValues(instance);
  }
}
