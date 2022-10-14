import React from 'react'
import Form from 'react-bootstrap/Form';
import { FloatingLabel, InputGroup, } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components'

const phone = <FontAwesomeIcon icon={faPhone} />

const Styles = styled.div`
  padding: 1rem;
  width: 200px;

  .phoneInput: {
    margin-left: 3px; !important
  }
  .input: {
    width: 100%;
    margin-left: 2px; !important
  }
`
const validateInput = value => {
  let error = ""

  if (!value) error = "Required!"
  else if (value.length !== 14) error = "Invalid phone format. ex: (555) 555-5555";

  return error;
};

const normalizeInput = (value, previousValue) => {
  if (!value) return value;
  const currentValue = value.replace(/[^\d]/g, '');
  const cvLength = currentValue.length;
  if (!previousValue || value.length > previousValue.length) {
    if (cvLength < 3) {
      const interim = `(${currentValue.slice()}`;
      return interim
    };
    if (cvLength === 3) {
      const interim = `(${currentValue.slice()})`;
      return interim;
    }
    if (cvLength < 6) {
      const interim = `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`;
      return interim
    }
    const interim = `(${currentValue.slice(0, 3)}) ${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`;
    return interim;
  }
};


class PhoneInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.values,
      label: this.props.label,
      name: this.props.name,
      id: this.props.id,
      handler: this.props.handler
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.submitPhone = this.submitPhone.bind(this);
    console.log("PhoneInput props: ", this.state);
  }

  handleChange({ target: { value } }) {
    this.setState(prevState => ({ value: normalizeInput(value, prevState.value) }));
  };

  handleSubmit(event) {
    console.log(this.state.value)
    event.preventDefault();
    const { value } = this.state;
  }

  submitPhone() {
    const { value } = this.state;
    const { onSubmit } = this.props.handler;
    onSubmit(value);
  }

  render() {

    return (
      <Styles>
      <Form.Group as="row">
        <InputGroup>
          <InputGroup.Text id="inputGroup-sizing-md">{phone}</InputGroup.Text>
            <Form.Control name={this.state.name} id={this.state.id} onChange={this.handleChange} className="phoneInput" onBlur={this.handleSubmit} type="phone" placeholder="(919) xxx-xxxx" value={this.state.value} />
        </InputGroup>
        </Form.Group>
      </Styles>
    );
  }
}

export default PhoneInput;