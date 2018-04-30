import { connect } from 'react-redux';
import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input, Col } from 'reactstrap';
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

// const query = gql`
// {
//   currentUser {
//     id
//   }
// }
// `;

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
    testResult: PropTypes.object,
    readonly: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      currentAnswer: props.question.currentAnswer,
      updated: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.fadeOut = this.fadeOut.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // only update answers if the data has changed
    if (prevProps.question.currentAnswer !== this.props.question.currentAnswer) {
      this.setState({
        updated: true,
        currentAnswer: this.props.question.currentAnswer,
      });
      setTimeout(this.fadeOut, 3000);
    }
  }

  fadeOut() {
    this.setState(Object.assign({}, this.state, {
      updated: false,
    }));
  }

  handleChange(event) {
    if (this.props.readonly) {
      return;
    }
    console.warn(this.props, event.target.name);
    const oldAnswer = this.state.currentAnswer;
    this.setState({
      currentAnswer: event.target.value,
    });
    this.props
      .mutate({
        variables: {
          question: this.props.question.uuid,
          answers: [event.target.value],
          testResult: this.props.testResult.uuid,
        },
      })
      .then((res) => {
        console.warn('res', res);
        console.warn(JSON.parse(res.data.createQuestionAnswer.answer.answer));
      })
      .catch((err) => {
        this.setState({
          currentAnswer: oldAnswer,
        });
        console.log('Network error');
      });
  }

  render() {
    return (
      <Col sm={{ order: 2 }} md={{ size: 6, order: 1 }} className="radio-question">
        <FormGroup tag="div">
          <legend>{this.props.question.question}</legend>
          {this.props.question.answers.edges.map(item => (
            <div key={item.node.uuid}>
              <FormGroup check className={(this.state.updated && this.state.currentAnswer === item.node.uuid) ? 'updated' : ''}>
                <Label check>
                  <Input
                    type="radio"
                    name={this.props.question.uuid}
                    value={item.node.uuid}
                    onChange={this.handleChange}
                    checked={this.state.currentAnswer === item.node.uuid}
                    readOnly={this.props.readonly}
                  />
                  {item.node.text}
                </Label>
              </FormGroup>
            </div>
          ))}
        </FormGroup>
      </Col>
    );
  }
}

RadioQuestion.defaultProps = {
  testResult: {},
  readonly: false,
};

// eslint-disable-next-line no-class-assign
// RadioQuestion = graphql(query)(RadioQuestion);
// eslint-disable-next-line no-class-assign
RadioQuestion = graphql(mutation)(RadioQuestion);
export default RadioQuestion;
