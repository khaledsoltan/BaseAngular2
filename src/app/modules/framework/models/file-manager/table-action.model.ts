export interface TableAction {
    name: string;
    icon?: string;
    permission?: string;
    handler: (rowData: any) => void;
    isHidden?: (rowData: any) => boolean;
}
