export interface Workflow {
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  version: number;
  description: string;
  process: Processes[];
}

export interface Processes {
  nameEn: string;
  nameAr: string;
  description: string;
  isRoot: boolean;
  isLeaf: boolean;
  stage: Stages[];
}

export interface Stages {
  nameEn: string;
  nameAr: string;
  description: string;
  isRoot: boolean;
  isLeaf: boolean;
  action: Actions[];
}

export interface Actions {
  nameEn: string;
  nameAr: string;
  field: Fields[];
}

export interface Fields {
  nameEn: string;
  nameAr: string;
  required: boolean;
  dataType: boolean;
}

export interface WorkflowServiceProvider {
  id: string;
  name: string;
}

export interface WorkflowServiceDetails {
  id: string;
  name: string;
  actionDetails?: WorkflowServiceActionDetails[];
}

export interface WorkflowServiceActionDetails {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  fullPath: string;
  uiExtensionServicePath: string;
  uiConfigurationServicePath: string;
  actionParameters: WorkflowActionParameters[];
}

export interface WorkflowActionParameters {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  type: number;
}

export interface WorkflowServiceExecution {
  path: string;
  parameters?: {
    id: string;
    value: string;
  }[];
}
