export class FileHelper {

  public static downloadFile(data: BlobPart, fileType: string, fileName: string) {
    const file = new Blob([data], { type: fileType });
    const fileURL = URL.createObjectURL(file);
    // window.open(fileURL);
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(fileURL);
      link.remove();
    }, 100);
  }
  public static isBase64(str: string) {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }
  public static getBase64(
    file,
    onload: (fileBase46: ArrayBuffer | string) => void,
    onerror?: (error: any) => void
  ) {
    const reader = new FileReader();
    reader.onload = function () {
      if (onload) {
        onload(reader.result as string);
      }
    };
    reader.onerror = function (error) {
      if (onerror) {
        onerror(error);
      }
    };
    reader.readAsDataURL(file);
  }
  public static getExtension(filename: string) {
    if (filename) {
      return filename.substring(filename.lastIndexOf('.') + 1, filename.length);
    } else {
      return '';
    }
  }

  public static isImage(filename) {
    const ext = this.getExtension(filename);
    if (ext) {
      switch (ext.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'tiff':
        case 'psd':
          return true;
      }
    }
    return false;
  }
  public static isPDf(filename) {
    const ext = this.getExtension(filename);
    if (ext) {
      switch (ext.toLowerCase()) {
        case 'pdf':
          return true;
      }
    }
    return false;
  }
  public static isVideo(filename) {
    var ext = this.getExtension(filename);
    if (ext) {
      switch (ext.toLowerCase()) {
        case 'm4v':
        case 'avi':
        case 'mpg':
        case 'mp4':
          return true;
      }
    }
    return false;
  }
  public static isVideoType(ext: string) {
    if (ext) {
      switch (ext.toLowerCase()) {
        case 'm4v':
        case 'avi':
        case 'mpg':
        case 'mp4':
          return true;
      }
    }
    return false;
  }
  public static getBlob(b64Data: string, contentType: string, sliceSize: number = 512) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      let byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    let blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  public static getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }
  public static async getBase64ImageFromUrl(imageUrl) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }
  public static calcFileSize(bytes) {
    if (bytes == 0) { return "0.00 B"; }
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
  }
}
