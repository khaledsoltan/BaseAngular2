export interface MenuItemPostedVM {
  id?: number,
  nameEn: string,
  nameAr: string,
  parentId?: number,
  urlpath?: string,
  isHidden?: boolean,
  iconFont?: string,
  isSearchResult?: boolean,
}

export interface IconFont {
  className: string,
  name: string,
}

export const IconFontClasses: IconFont[] = [
  { className: 'm-menu__link-icon fa fa-layer-group', name: 'Layers' },
  { className: 'm-menu__link-icon flaticon-users', name: 'Users' },
  { className: 'm-menu__link-icon la la-money', name: 'Money' },
  { className: 'm-menu__link-icon la la-cogs', name: 'Settings' },
  { className: 'm-menu__link-icon la la-gear', name: 'Gear' },
  { className: 'm-menu__link-icon fa fa-coins', name: 'Coins' },
  { className: 'm-menu__link-icon fa fa-broadcast-tower', name: 'Broad Cast' },
  { className: 'm-menu__link-icon la la-building', name: 'Building' },
  { className: 'm-menu__link-icon fa fa-address-card', name: 'Address Card' },
  { className: 'm-menu__link-icon la la-globe', name: 'Global' },
  { className: 'm-menu__link-icon la la-print', name: 'Print' },
  { className: 'm-menu__link-icon la fa fa-dollar-sign', name: 'Dollar Sign' },
  { className: 'm-menu__link-icon fa fa-hands-helping', name: 'Hands Helping' },
  { className: 'm-menu__link-icon fa fa-address-book', name: 'Address Book' },
];