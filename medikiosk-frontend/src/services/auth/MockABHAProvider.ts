import type { PatientProfile } from '@/features/patient/PatientSessionContext';

export class MockABHAProvider {
  /**
   * Simulates an ABHA verification API call.
   * Resolves with synthetic demographic data if the ABHA is 14 digits.
   * Throws an error otherwise.
   */
  static async verifyAbha(abhaId: string): Promise<PatientProfile> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const cleanAbha = abhaId.replace(/\D/g, '');
        
        if (cleanAbha.length !== 14) {
          reject(new Error('Invalid ABHA Number. It must be exactly 14 digits.'));
          return;
        }

        // Mock verification response
        resolve({
          id: 'PT-DEMO-99201',
          name: 'Rameshwar Patil',
          age: '62',
          gender: 'Male',
          mobile: '9823199011',
          district: 'Satara',
          state: 'Maharashtra'
        });
      }, 1500); // 1.5 seconds mock delay
    });
  }
}
