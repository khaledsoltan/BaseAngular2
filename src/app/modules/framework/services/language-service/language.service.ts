import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
declare let $: any;

export enum Language {
  Arabic = 'ar',
  English = 'en'
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private lang!: Language;
  private langKey = 'lang';
  public LangChanged: BehaviorSubject<Language> = new BehaviorSubject<Language>(
    this.lang
  );
  loadedFilesCounter: number = 0;

  public get Lang() {
    return this.lang;
  }
  constructor(private translate: TranslateService) {
    this.setLanguageIfNotExists();
    translate.setDefaultLang(Language.English);
  }

  private setLanguageIfNotExists() {
    this.lang = localStorage.getItem(this.langKey) as Language;
    if (
      !this.lang ||
      (this.lang !== Language.Arabic && this.lang !== Language.English)
    ) {
      this.lang = Language.English;
      localStorage.setItem(this.langKey, this.lang);
    }
    this.setLanguage(this.lang);
  }

  setLanguage(lang: Language) {
    if (!lang || (lang !== Language.Arabic && lang !== Language.English)) {
      this.lang = Language.English;
    } else {
      this.lang = lang;
    }
    localStorage.setItem(this.langKey, this.lang);

    this.translate.use(this.lang);
    if (this.LangChanged.value !== this.lang) {
      document.documentElement.setAttribute('dir', this.lang === Language.Arabic ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', this.lang);
      this.LangChanged.next(this.lang);
    }
  }
}
