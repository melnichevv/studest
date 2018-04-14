import moment from 'moment';

export default function processDate(strDate) {
  return moment(strDate).format('YYYY-MM-DD HH:mm');
};
