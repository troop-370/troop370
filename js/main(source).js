import {MDCRipple} from '@material/ripple';

const buttonRipple = [].map.call(document.querySelectorAll('.mdc-button'), function(el) {
  return new MDCRipple(el);
});

const iconButtonRipple = new MDCRipple(document.querySelector('.mdc-icon-button'));
iconButtonRipple.unbounded = true;

const ripple = [].map.call(document.querySelectorAll('li>a'), function(el) {
  return new MDCRipple(el);
});


import {MDCTextField} from '@material/textfield';

const textField = [].map.call(document.querySelectorAll('.mdc-text-field'), function(el) {
  return new MDCTextField(el);
});


import {MDCNotchedOutline} from '@material/notched-outline';

const notchedOutline = [].map.call(document.querySelectorAll('.mdc-notched-outline'), function(el) {
  return new MDCNotchedOutline(el);
});
