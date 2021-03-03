import React from 'react';
import numeral from 'numeral';

export default ({ value }) => (
  <span className="amount">{`¥${numeral(value).format('0,0.00')}`}</span>
);
