import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  Column,
  ExportTypes,
  ExportScreenWidth,
  Pipes
} from '../models/data-list/data-list';
import { DatePipe, DecimalPipe } from '@angular/common';
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver';
import * as html2pdf from 'html2pdf.js';

// import * as html2canvas from 'html2canvas';
// import * as jsPDF from 'jspdf';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
// (window as any).html2canvas = html2canvas;
@Injectable({
  providedIn: 'root'
})
export class ExportFileService {
  // logoPath: string = 'assets/icons/ms-icon-310x310.png';
  logoPath = 'assets/images/imgs/logo180.png';
  logoBase64: string;
  constructor(private datePipe: DatePipe,
    private decimalPipe: DecimalPipe
  ) {

    this.toDataUrl(this.logoPath, base64 => {
      this.logoBase64 = base64;
    });
  }

  /**
   * Export Excel file
   * @param data
   * @param cols
   * @param FileName
   */
  public exportAsExcelFile(
    data: any[],
    cols: Column[],
    FileName: string
  ): void {
    const tableHeaders: Column[] = this.getTableHeaders(cols);
    const mappedDataArr: any[] = [];
    // Table Rows
    for (let i = 0; i < data.length; i++) {
      mappedDataArr[i] = {};
      for (let index = 0; index < tableHeaders.length; index++) {
        if (tableHeaders[index].pipe === Pipes.date) {
          mappedDataArr[i][tableHeaders[index].title] = this.datePipe.transform(
            data[i][tableHeaders[index].field],
            tableHeaders[index].pipeFormat || 'dd/MM/yyyy'
          );
        } else if (tableHeaders[index].pipe === Pipes.money) {
          mappedDataArr[i][tableHeaders[index].title] = this.decimalPipe.transform(
            data[i][tableHeaders[index].field],
            '1.2-2', 'en-us'
          );
        } else if (tableHeaders[index].pipe === Pipes.decimal) {
          mappedDataArr[i][tableHeaders[index].title] = this.decimalPipe.transform(
            data[i][tableHeaders[index].field],
            '1.0-0', 'en-us'
          );
        } else {
          mappedDataArr[i][tableHeaders[index].title] =
            data[i][tableHeaders[index].field];
        }
        if (tableHeaders[index].exportTempalte && tableHeaders[index].exportTempalte.length > 0) {
          const ind = tableHeaders[index].exportTempalte.findIndex(y => y.key === data[i][tableHeaders[index].field]);
          if (ind != -1)
            mappedDataArr[i][tableHeaders[index].title] =
              tableHeaders[index].exportTempalte[ind].value;
        }
      }
    }
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mappedDataArr);
    /* cols styles */
    worksheet['!cols'] = tableHeaders.map(() => {
      return { width: 30 };
    });
    /* rows styles */
    worksheet['!rows'] = tableHeaders.map(() => {
      return { hpx: 20 };
    });
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data']
    };
    XLSX.writeFile(workbook, FileName + '.xlsx');
  }

  /**
   * export as pdf file
   * @param data
   * @param cols
   * @param fileName
   */
  public exportAsPdfFile(
    fileName: string,
    getHtmlTemplate: Function,
    exportScreenWidth: ExportScreenWidth = ExportScreenWidth.landscape
  ): void {
    const opt = {
      margin: 1,
      filename: fileName + '.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: exportScreenWidth },
      pagebreak: {
        mode: ['css'],
        before: ['#afterBreak']
        // avoid: ['.avoidBreak']
      }
    };
    html2pdf()
      .from(getHtmlTemplate())
      .set(opt)
      .save();
  }

  /**
   * export as word file
   * @param data
   * @param cols
   * @param fileName
   */
  public async exportAsWordFile(
    fileName: string,
    getHtmlTemplate: Function,
    exportScreenWidth: ExportScreenWidth = ExportScreenWidth.landscape
  ) {
    const content = getHtmlTemplate();
    const converted = await asBlob(content, {
      orientation: exportScreenWidth
    })
    // var converted = htmlDocx.asBlob(content, {
    //   orientation: exportScreenWidth
    // });
    saveAs(converted, fileName + '.docx');
  }

  private getTableHeaders(cols: Column[]): Column[] {
    const keysArr: Column[] = [];
    for (let i = 0; i < cols.length; i++) {
      if (!cols[i].hidden && cols[i].field !== 'actions') {
        keysArr.push(cols[i]);
      }
    }
    return keysArr;
  }

  getExportFileHtmlTable(
    data: any[],
    cols: Column[],
    fileName: string,
    exportType: ExportTypes
  ): string {
    const rowsPerPage: number = exportType === ExportTypes.word ? 6 : 12;
    const pagesCount = Math.ceil(data.length / rowsPerPage);
    const tableHeaders: Column[] = this.getTableHeaders(cols);
    let content = '<html><body style="size: A4">';

    // iterate through pages
    for (let pageIndex = 0; pageIndex < pagesCount; pageIndex++) {
      content += this.getExportFileHeader(
        fileName,
        exportType,
        true,
        pageIndex
      );
      content += '<table style="width: 100%; margin-top: 15px;">';

      // table headers
      content += '<thead><tr style="background-color: #56AAFF; color: #fff;">';
      for (let i = 0; i < tableHeaders.length; i++) {
        content += `<th style="padding: 3px 6px; font-size: 12px;">${tableHeaders[i].title}</th>`;
      }
      content += '</tr></thead>';

      // table body
      content += '<tbody>';
      const lastRowIndexInPage =
        pageIndex + 1 === pagesCount
          ? data.length
          : (pageIndex + 1) * rowsPerPage;
      for (let i = pageIndex * rowsPerPage; i < lastRowIndexInPage; i++) {
        content += `<tr style='${(i + 1) % 2 === 0 ? 'background: #f1faff' : ''
          }'>`;
        for (let index = 0; index < tableHeaders.length; index++) {
          content += '<td style="padding: 3px 6px; font-size: 12px;">';
          if (tableHeaders[index].pipe === Pipes.date) {
            content +=
              data[i][tableHeaders[index].field] !== null
                ? this.datePipe.transform(
                  data[i][tableHeaders[index].field],
                  tableHeaders[index].pipeFormat || 'dd/MM/yyyy'
                )
                : '';
          } else if (tableHeaders[index].pipe === Pipes.money) {
            content +=
              data[i][tableHeaders[index].field] !== null
                ? this.decimalPipe.transform(
                  data[i][tableHeaders[index].field],
                  '1.2-2', 'en-us'
                )
                : '';
          } else if (tableHeaders[index].pipe === Pipes.decimal) {
            content +=
              data[i][tableHeaders[index].field] !== null
                ? this.decimalPipe.transform(
                  data[i][tableHeaders[index].field],
                  '1.0-0', 'en-us'
                )
                : '';
          } else if (tableHeaders[index].exportTempalte && tableHeaders[index].exportTempalte.length > 0) {
            const ind = tableHeaders[index].exportTempalte.findIndex(y => y.key === data[i][tableHeaders[index].field]);
            if (ind != -1)
              content +=
                tableHeaders[index].exportTempalte[ind].value;
          } else {
            content +=
              data[i][tableHeaders[index].field]
                ? data[i][tableHeaders[index].field].toString()
                : '';
          }
          content += '</td>';
        }
        content += '</tr>';
      }
      content += '</tbody></table></div>';
      content += this.getExportFileFooter(pageIndex + 1);
      content += '</div>';
    }
    content += '</body></html>';
    return content;
  }

  private getExportFileHeader(
    fileName: string,
    exportType: ExportTypes,
    pagebreak = false,
    pageIndex = 0
  ): string {
    let content = `<div id=${pagebreak && pageIndex > 0 ? 'afterBreak' : null}
    style="width: 100%;font-family: Tahoma !important;position: relative; height: 16cm;">
    <div style="display: table; width: 100%; height: auto;
    border-bottom: 2px solid #56AAFF; background-color: #fff; padding: 8px 15px;">
    <table style="width: 100%;">

    <tbody>
    <tr style="display: flex; justify-content:space-between;align-items:center">
      <td style="padding: 8px 15px; font-size: 20px; font-family: Tahoma;">
        <span style="color: #56AAFF;">Marsum</span>
      </td>
      <td style="padding: 8px 15px; font-size: 18px;">`;
    if (exportType === ExportTypes.pdf) {
      content += `<img src="${this.logoPath}">`;
    } else {
      content += `<img src="${this.logoBase64}" >`;
    }
    // <img src='${this.logoBase64}' style="max-width: 48px; max-height: 48px;">;
    content += `</td>
    <td style="padding: 8px 15px; font-size: 1.25rem;">
     <span style="color: #56AAFF;"> مرسوم </span>
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    <div style="padding: 15px; background-color: #fff;" >
      <table style="width: 100%; margin-top: 15px;">
      <tbody>
        <tr>
          <td style="padding: 8px 15px; font-size: 11px; width: 33.3%;">
          </td>
          <td style="padding: 8px 15px; font-size: 18px; width: 33.3%; text-align:center;">${fileName}</td>
          <td style="padding: 8px 15px; font-size: 12px; width: 33.3%; text-align:right">
          </td>
        </tr>
      </tbody>
    </table>`;
    return content;
  }

  private getExportFileFooter(pageNumber: number): string {
    return `<div style="background-color: #fff; border-top: 2px solid #56AAFF; padding: 15px;
    position: absolute;bottom: 0px;left: 0px;right: 0px;">
    <table style="width: 100%;  ">
      <tbody>
        <tr>
          <td style="padding: 8px 15px;  font-size: 11px;  width: 50%; vertical-align: middle; text-align: left;">
            <p style="margin-bottom: 0;">Page ${pageNumber}</p>
          </td>
          <td style="padding: 8px 15px; font-size: 11px;  width: 50%; vertical-align: middle; text-align: right;">
            <p style="margin-bottom: 0; ">Printed Date: ${this.datePipe.transform(
      new Date(),
      'dd/MM/yyyy'
    )}</p>
            <p style="margin-bottom: 0; ">Printed Time: ${this.datePipe.transform(
      new Date(),
      'h:mm a'
    )}</p>
          </td>
        </tr>
      </tbody>
    </table>
    </div>`;
  }




  private async toDataUrl(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = await function () {
      const reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    await xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }
}
