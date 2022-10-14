import { Form, Row, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import React from 'react';

export default class Chooser extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.state = {
      dataType: props.dataType,
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
                    dataType: eventKey,
                  });
                }}
              >
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  {this.state.dataType}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {this.state.myChoices.map((v, i) => <Dropdown.Item key={v.id} id={v.id} eventKey={v.value}>{v.value}</Dropdown.Item>)}
                </Dropdown.Menu>
              </Dropdown>
            </Row>
          </Form.Group>
        </Form>
      </div>
    )
  }
}