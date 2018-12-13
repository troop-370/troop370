import {MDCRipple} from '@material/ripple/index';
const ripple = new MDCRipple(document.querySelector('.foo-button'));

var x = document.getElementsByClassName('mdc-button');
var i;
for (i = 0; i < x.length; i++) {
    MDCRipple.attachTo(x[i]);
}

var x = document.getElementsByClassName('ripple');
var i;
for (i = 0; i < x.length; i++) {
    MDCRipple.attachTo(x[i]);
}

import {MDCList} from '@material/list';
const list = new MDCList(document.querySelector('.mdc-list'));
const listItemRipples = list.listElements.map((listItemEl) => new MDCRipple(listItemEl));
