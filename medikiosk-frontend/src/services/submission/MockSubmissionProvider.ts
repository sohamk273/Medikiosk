export class MockSubmissionProvider {
  static getProcessingDuration(): number {
    return 1800; // 1.8 seconds processing time
  }

  static async submitCase(): Promise<{
    success: boolean;
    caseId: string;
    submittedAt: string;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          caseId: 'MEDI-OPD-2026-00042',
          submittedAt: new Date().toISOString(),
        });
      }, this.getProcessingDuration());
    });
  }
}
