import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'code-template',
  templateUrl: './code-template.component.html',
  styleUrls: ['./code-template.component.scss']
})
export class CodeTemplateComponent implements OnInit {
  @Input('code') code: string;
  @Input('url') url: string;
  @Input('target') target = '_self';
  @Input('id') id: number;
  @Input('hasNewTabLink') hasNewTabLink = true;
  @Input('params') params?: any;
  @Input('onClick') onClick: (id: any, fromNewTabLink: boolean, params?: any) => void;

  constructor() { }

  ngOnInit() {
  }

}
