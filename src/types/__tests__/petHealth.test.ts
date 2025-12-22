/**
 * PetHealth Types Tests
 * 测试宠物健康相关类型定义
 */

import { PetHealthRecord, CreateHealthRecordParams, HealthRecordType } from '../petHealth';

describe('PetHealth Types', () => {
  describe('HealthRecordType Type', () => {
    it('should accept valid record types', () => {
      // Arrange
      const vaccine: HealthRecordType = 'vaccine';
      const deworming: HealthRecordType = 'deworming';

      // Act & Assert
      expect(vaccine).toBe('vaccine');
      expect(deworming).toBe('deworming');
    });
  });

  describe('PetHealthRecord Interface', () => {
    it('should allow creating valid health record', () => {
      // Arrange
      const record: PetHealthRecord = {
        id: 1,
        pet_id: 10,
        record_type: 'vaccine',
        name: 'Rabies',
        date: '2023-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      // Act & Assert
      expect(record.id).toBe(1);
      expect(record.record_type).toBe('vaccine');
      expect(record.name).toBe('Rabies');
    });
  });

  describe('CreateHealthRecordParams Interface', () => {
    it('should allow creating valid create params', () => {
      // Arrange
      const params: CreateHealthRecordParams = {
        pet_id: 10,
        record_type: 'deworming',
        name: 'Drontal',
        date: '2023-02-01',
      };

      // Act & Assert
      expect(params.pet_id).toBe(10);
      expect(params.record_type).toBe('deworming');
    });
  });
});
