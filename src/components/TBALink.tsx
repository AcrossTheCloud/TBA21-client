import React from 'react'

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { closeAllModal } from '../actions/modals/allModal';

const TBALink = ({ to, closeAllModal, ...props }) =>
  <Link to={to} {...props} onClick={() => {
    closeAllModal()
    props.onClick && props.onClick()
  }} />

export default connect(null, {
  closeAllModal
})(TBALink)
