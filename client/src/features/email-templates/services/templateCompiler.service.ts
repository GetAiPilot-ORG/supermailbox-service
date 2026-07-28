import type { QualityIssue } from '../types/template.types';

export function getCriticalQualityIssues(issues: QualityIssue[]) {
  return issues.filter((issue) => issue.level === 'error');
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
