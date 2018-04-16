import { connect } from 'react-redux';
import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
// import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';
// import * as logout from '../../../actions/authActions';
require('./Question.css');

const mutation = gql`
  mutation CreateView($testResult: String!, $question: String!, $answers: [String!]) {
    createQuestionAnswer(testResult: $testResult, question: $question, answers: $answers) {
      status
      formErrors
      answer {
        answer
      }
    }
  }
`;

const query = gql`
{
  currentUser {
    id
  }
}
`

const mapStateToProps = state => ({
  ...state,
});

function mapDispatchToProps(dispatch) {
  return {
    // ...bindActionCreators(logout, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class RadioQuestion extends Component {
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
    this.handleChange = this.handleChange.bind(this);
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  handleChange(event) {
    console.warn(this.props, event.target.name);
    this.props
      .mutate({
        variables: {
          question: this.props.question.uuid,
          answers: [event.target.value],
          testResult: this.props.testResult.uuid,
        },
      })
      .then(res => {
        console.warn('res', res);
        console.warn(JSON.parse(res.data.createQuestionAnswer.answer.answer));
        // if (res.data.createMessage.status === 200) {
        //   window.location.replace('/')
        // }
        // if (res.data.createMessage.status === 400) {
        //   this.setState({
        //     formErrors: JSON.parse(res.data.createMessage.formErrors),
        //   })
        // }
      })
      .catch(err => {
        console.log('Network error')
      })
  }

  render() {
    console.warn('radio', this.props);
    return (
      <div className="radio-question">
        <FormGroup tag="aa">
          <legend>{this.props.question.question}[{this.props.question.currentAnswer}]</legend>
          {this.props.question.answers.edges.map(item => (
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name={this.props.question.uuid}
                  value={item.node.uuid}
                  onChange={this.handleChange}
                  checked={this.props.question.currentAnswer === item.node.uuid}
                />
                {item.node.text}
              </Label>
            </FormGroup>
          ))}
        </FormGroup>
      </div>
    );
  }
}

// eslint-disable-next-line no-class-assign
RadioQuestion = graphql(query)(RadioQuestion);
// eslint-disable-next-line no-class-assign
RadioQuestion = graphql(mutation)(RadioQuestion);
export default RadioQuestion;
