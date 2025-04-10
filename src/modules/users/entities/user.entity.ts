import { allow } from 'joi';
import {
  Column,
  Model,
  Table,
  DataType,
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import {
  NigerianStates,
  NIGERIAN_STATES,
} from '../../../shared/utils/nigeria-states';
import { normalizeNigerianState } from '../../../shared/utils/nigeria-states-helpers';
import { normalizeEnumValue } from '../../../shared/utils/case-normalizer';
import { Col } from 'sequelize/types/utils';

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
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
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
  })
  declare instructorStatus: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isEmailVerified: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare emailVerificationToken: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare emailVerificationExpires: Date | null;

  @Column({
    type: DataType.ENUM(...GSM_NETWORKS),
    allowNull: false,
  })
  declare gsmNetwork: GsmNetwork;

  @Column({
    type: DataType.STRING,
    allowNull: false,
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
  })
  declare placeOfWork: string;

  @Column({
    type: DataType.ENUM(...PROFESSIONS),
    allowNull: false,
  })
  declare professionalCadre: Profession;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare others: string;

  // Timestamps
  declare createdAt: Date;
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
