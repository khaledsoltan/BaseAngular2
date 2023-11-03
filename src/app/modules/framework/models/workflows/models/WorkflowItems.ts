export interface WorkflowItems {
  workflows: string;
  itemName: string;
  order?: number;
}

export enum ItemType {

  Workflow = 1,
  Process = 2,
  Stage = 3,
  Action = 4,
  Field = 5,
  // Activation = 'Activation'
}

export enum Activation {
  Active = 1,
  Inactive = 2
}

export enum StageTypes {
  Normal = 1,
  Endpoint = 2,
  EndpointSNP = 3
}
