import { Form, Row, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import React from 'react';

export default class Chooser extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.state = {
      buttonName: "Choose One",
      myChoices: props.choices,
    }
  }

  render() {
    return (
      <div className="App d-flex flex-column align-items-center">

        <Form
          name="chooser"
          className="align-items-center"
          style={{ width: '90%' }}
        >
          <Form.Group>
            <Row className="mb-3">
              <Dropdown
                onSelect={(eventKey) => {
                  this.setState({
                    buttonName: eventKey,
                  });
                }}
              >
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  {this.state.buttonName}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {this.state.myChoices.map((v, i) => <Dropdown.Item id={v.id} eventKey={v.value}>{v.value}</Dropdown.Item>)}
                </Dropdown.Menu>
              </Dropdown>
            </Row>
          </Form.Group>
        </Form>
      </div>
    )
  }
}