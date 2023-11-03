import { Task } from './Task';

export interface Stage {
  id?: number,
  name: string,
  isRoot: boolean;
  isLeaf: boolean;
  entityId: number;
  nextStageId: number;
  Description?: string;
  workflowProcessStageTask: Task[];
}
