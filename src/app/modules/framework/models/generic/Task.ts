import { TaskFeature } from './TaskFeature';

export interface Task {
  id?: number,
  name?: string,
  nameEn: string,
  nameAr: string,
  workflowProcessStageTaskField: TaskFeature[]
}
