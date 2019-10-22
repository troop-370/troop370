import {MDCRipple} from '@material/ripple';

const buttonRipple = [].map.call(document.querySelectorAll('.mdc-button'), function(el) {
  return new MDCRipple(el);
});

const iconButtonRipple = new MDCRipple(document.querySelector('.mdc-icon-button'));
iconButtonRipple.unbounded = true;

const topNavRipple = [].map.call(document.querySelectorAll('li>a'), function(el) {
  return new MDCRipple(el);
});

const ripple = [].map.call(document.querySelectorAll('.mdc-ripple-surface'), function(el) {
  return new MDCRipple(el);
});

import {MDCFormField} from '@material/form-field';
import {MDCTextField} from '@material/textfield';
import {MDCCheckbox} from '@material/checkbox';
import {MDCSelect} from '@material/select';

const formField = [].map.call(document.querySelectorAll('.mdc-form-field'), function(el) {
  return new MDCFormField(el);
});
const textField = [].map.call(document.querySelectorAll('.mdc-text-field'), function(el) {
  return new MDCTextField(el);
});
const checkbox = [].map.call(document.querySelectorAll('.mdc-checkbox'), function(el) {
  return new MDCCheckbox(el);
});
const select = [].map.call(document.querySelectorAll('.mdc-select'), function(el) {
  return new MDCSelect(el);
});
select.listen('MDCSelect:change', () => {
  alert(`Selected option at index ${select.selectedIndex} with value "${select.value}"`);
});

import {MDCNotchedOutline} from '@material/notched-outline';

const notchedOutline = [].map.call(document.querySelectorAll('.mdc-notched-outline'), function(el) {
  return new MDCNotchedOutline(el);
});

import {MDCTabBar} from '@material/tab-bar';

const tabBar = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
