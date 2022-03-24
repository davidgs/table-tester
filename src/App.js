import React, { useMemo, useState, useEffect } from "react";
import logo from './logo.svg';
import './App.css';
// import Table from "./Table";
import styled from 'styled-components'
import { useTable, useSortBy, useRowSelect, useResizeColumns } from "react-table";
// import Form from 'react-bootstrap/Form';
import { Form, FormLabel, Col, Row, Button, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
      .checkBox {
        max-width: 20px;
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
      input {
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
      }

      .resizer {
        display: inline-block;
        background: black;
        width: 1px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(50%);
        z-index: 1;
        ${'' /* prevents from scrolling while dragging on touch devices */}
        touch-action:none;

        &.isResizing {
          background: red;
        }
      }
    }

  }
`
const menuItems = [{ id: 1, value: "Drivers" }, { id: 2, value: "Attendees" }];
const data = [
  {
    "_id": {
      "$oid": "56e839bf76d7549bd70aabb5"
    },
    "Name": "Bob Richter",
    "Address": "1812 Bodwin Lane",
    "City": "Apex",
    "State": "NC",
    "Zip": "27502",
    "CellPhone": "919-880-2041 ",
    "Email": "bjr27519@gmail.com",
    "Location": {
      "lat": 35.7165291,
      "lng": -78.86555570000002
    },
    "id": "56e49d7a0f270b735d856577",
    "HomePhone": "919-880-1877",
    "Notes": ""
  },
  { "_id": { "$oid": "56e839bf76d7549bd70aabb8" }, "Name": "Jacin Suski", "Address": "1556 Salem Village Drive", "City": "Apex", "State": "NC", "Zip": "27502-4727", "CellPhone": "801-834-5660 ", "Email": "", "Location": { "lat": 35.7134761, "lng": -78.8641968 }, "id": "56e49d9c0f270b735d856579", "HomePhone": "919-388-3693 ", "Notes": "" },
  { "_id": { "$oid": "56e839bf76d7549bd70aabb6" }, "Name": "Loulie Metzger", "Address": "6012 Winthrop Drive", "City": "Raleigh", "State": "NC", "Zip": "27612", "CellPhone": "", "Email": "imandloulleggmail.com", "Location": { "lat": 35.864261, "lng": -78.68772899999999 }, "id": { "$oid": "56e839bf76d7549bd70aabb6" }, "HomePhone": "919-782-3833", "Notes": "three ladies who attend the dinners and I am able to drive them.\nThey are Annette Mallory, Lea Williams and her dog, and Bonnie Kemp.", "Passengers": [{ "lat": 35.8320892, "lng": -78.6685708 }] }
];

// Create an editable cell renderer
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue)

  const onChange = e => {
    setValue(e.target.value)
  }

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value)
  }

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return <input value={value} onChange={onChange} onBlur={onBlur} size={value.length}/>
}

// Set our editable cell renderer as the default Cell renderer
// const defaultColumn = {
//   Cell: EditableCell,
// }

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    )
  }
)

function Table({ columns, data, updateMyData, skipPageReset }) {
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 500,
      Cell: EditableCell,
    }),
    []
  )

  // Use the useTable Hook to send the columns and data to build the table
  const {
    getTableProps, // table props from react-table
    getTableBodyProps, // table body props from react-table
    headerGroups, // headerGroups, if your table has groupings
    rows, // rows for the table based on the data passed
    prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
    selectedFlatRows,
    resetResizing,
    state: { selectedRowIds },
  } = useTable({
    columns,
    data,
    defaultColumn,
    // use the skipPageReset option to disable page resetting temporarily
    autoResetPage: !skipPageReset,
    // updateMyData isn't part of the API, but
    // anything we put into these options will
    // automatically be available on the instance.
    // That way we can call this function from our
    // cell renderer!
    updateMyData,
  }, useSortBy, useResizeColumns, useRowSelect, hooks => {
    hooks.visibleColumns.push(columns => [
      // Let's make a column for selection
      {
        id: 'selection',
        // The header can use the table's getToggleAllRowsSelectedProps method
        // to render a checkbox
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <div>
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        // The cell can use the individual row's getToggleRowSelectedProps method
        // to the render a checkbox
        Cell: ({ row }) => (
          <div>
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} className="checkBox" />
          </div>
        ),
      },
      ...columns,
    ])
  }
  );

  /*
    Render the UI for your table
    - react-table doesn't have UI, it's headless. We just need to put the react-table props from the Hooks, and it will do its magic automatically
  */
  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                  {/* Use column.getResizerProps to hook up the events correctly */}
                  <div
                    {...column.getResizerProps()}
                    className={`resizer ${column.isResizing ? 'isResizing' : ''
                      }`}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p>Don't Upload Rows: {Object.keys(selectedRowIds).length} &nbsp;
        {selectedFlatRows.map(
          d => d.original.Name + " "
        )}</p>
    </>
  );


}

function SelForm({ choices }) {
  const [myChoices] = React.useState(choices);
  return (
    <div>
    <Form>
      <Form.Group>
        <Row className="mb-3">
          <Dropdown
            onSelect={(eventKey) => {
              const g = eventKey === 'orgs' ? 'block' : 'none';
              this.setState({
                orgs: g,
              });
            }}
          >
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Select Data Source
            </Dropdown.Toggle>
                <Dropdown.Menu>
                {myChoices.map((v, i) => <Dropdown.Item eventKey={v.id}>{v.value}</Dropdown.Item>)}
              <Dropdown.Item key="Drivers" eventKey="Drivers">
                Drivers
              </Dropdown.Item>
              <Dropdown.Item key="Attendees" eventKey="Attendees">
                Attendees
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Row>
      </Form.Group>
      </Form>
      </div>
  );
}

function App() {
  const menuItems = [{ id: 1, value: "Drivers" }, { id: 2, value: "Attendees" }];
  const columns = useMemo(
    () => [
      {
        // first group - TV Show
        Header: "Organization Data",
        // First group columns
        columns: [
          {
            Header: "Select All",
          },
          {
            Header: "Data",
          },
        ],
        columns: [
          {
            Header: "Name",
            accessor: "Name"
          },
          {
            Header: "Address",
            accessor: "Address"
          },
          {
            Header: "City",
            accessor: "City"
          },
          {
            Header: "State",
            accessor: "State"
          },
          {
            Header: "Zip Code",
            accessor: "Zip"
          },
          {
            Header: "Home Phone",
            accessor: "HomePhone"
          },
          {
            Header: "Cell Phone",
            accessor: "CellPhone"
          },
          {
            Header: "Email",
            accessor: "Email"
          },
          {
            Header: "Notes",
            accessor: "Notes"
          },
        ]
      },
    ],
    []
  );


  const [skipPageReset, setSkipPageReset] = React.useState(false)
  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    setSkipPageReset(true)
    // setData(old =>
    //   old.map((row, index) => {
    //     if (index === rowIndex) {
    //       return {
    //         ...old[rowIndex],
    //         [columnId]: value,
    //       }
    //     }
    //     return row
    //   })
    // )
  }

  // After data chagnes, we turn the flag back off
  // so that if data actually changes when we're not
  // editing it, the page is reset
  React.useEffect(() => {
    setSkipPageReset(false)
  }, [data])

  return (
    <div className="App">
      <h1>Blind Ministry Data Entry</h1>
      <SelForm choices={menuItems} />
      <Styles>
        <Table
          columns={columns}
          data={data}
          updateMyData={updateMyData}
          skipPageReset={skipPageReset}
          />
        </Styles>
    </div>
  );
}

export default App;
