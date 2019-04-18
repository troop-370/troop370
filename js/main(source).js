import {MDCRipple} from '@material/ripple';

const buttonRipple = [].map.call(document.querySelectorAll('.mdc-button'), function(el) {
  return new MDCRipple(el);
});

const iconButtonRipple = new MDCRipple(document.querySelector('.mdc-icon-button'));
iconButtonRipple.unbounded = true;

const ripple = [].map.call(document.querySelectorAll('li>a'), function(el) {
  return new MDCRipple(el);
});
