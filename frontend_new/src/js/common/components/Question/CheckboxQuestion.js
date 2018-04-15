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
class CheckboxQuestion extends PureComponent {
  static propTypes = {
    question: PropTypes.object.isRequired,
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
    console.warn('checkbox', this.props);
    return (
      <div className="checkbox-question">
        <FormGroup tag="aa">
          <legend>{this.props.question.question}</legend>
          {this.props.question.answers.edges.map(item => (
            <FormGroup check>
              <Label check>
                <Input type="checkbox" name={this.props.question.uuid} />
                {item.node.text}
              </Label>
            </FormGroup>
          ))}
        </FormGroup>
      </div>
    );
  }
}

export default CheckboxQuestion;
