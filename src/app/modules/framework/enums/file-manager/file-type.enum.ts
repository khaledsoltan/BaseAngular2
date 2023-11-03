export enum FileType {
    All = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,application/msword',
    ImageOnly = 'image/*',
    FileOnly = 'application/pdf,.doc,.docx,.xls,.xlsx,application/msword',
    PdfOrWordOnly = 'application/pdf,.doc,.docx,application/msword',
    ImageAndPdf = 'image/png,image/jpg,image/jpeg,application/pdf'
}
