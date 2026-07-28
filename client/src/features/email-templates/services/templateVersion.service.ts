import { templateService } from './template.service';

export const templateVersionService = {
  list: templateService.listVersions,
  restore: templateService.restoreVersion,
};
