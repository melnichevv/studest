import moment from 'moment';

export function processDate(strDate) {
  return moment(strDate).format('YYYY-MM-DD HH:mm');
}

export function toMoment(strDate) {
  return moment(strDate);
}
