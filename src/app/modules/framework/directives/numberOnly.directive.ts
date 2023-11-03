import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[appNumberOnly]'
})
export class NumberOnlyDirective {
    constructor() { }

    @HostListener('keypress', ['$event'])
    onKeyPress(event: KeyboardEvent): boolean {
        debugger;
        const charCode = event.which || event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return false;
        }
        return true;
    }
    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent): boolean {
        const clipboardData = event.clipboardData || (window as any).clipboardData;
        const text = clipboardData.getData('text');

        if (/[^0-9]/.test(text)) {
            event.preventDefault();
            return false;
        }

        return true;
    }
}
