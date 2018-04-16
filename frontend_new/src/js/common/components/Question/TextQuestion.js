import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
// import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';
// import * as logout from '../../../actions/authActions';
require('./Question.css');

const mapStateToProps = state => ({
  ...state,
});

function mapDispatchToProps(dispatch) {
  return {
    // ...bindActionCreators(logout, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class TextQuestion extends PureComponent {
  static propTypes = {
    question: PropTypes.object.isRequired,
    testResult: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  render() {
    console.warn('text', this.props);
    return (
      <div className="text-question">
        <FormGroup tag="aa">
          <legend>{this.props.question.question}</legend>
          <FormGroup>
            <Input type="textarea" name={this.props.question.uuid} id={this.props.question.uuid} />
          </FormGroup>
        </FormGroup>
      </div>
    );
  }
}

export default TextQuestion;
