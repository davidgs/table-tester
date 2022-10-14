import React, { useMemo, useState, useEffect } from "react";
import logo from './logo.svg';
import './App.css';
// import Table from "./Table";
import styled from 'styled-components'
import { useTable, useSortBy, useRowSelect, useResizeColumns } from "react-table";
// import Form from 'react-bootstrap/Form';
import { Form, FormLabel, Col, Row, Button, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import Chooser from './Chooser'
import axios from 'axios'
import PhoneInput from "./PhoneInput";

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
    tbody tr:nth-child(odd) td{
  background-color: #9493B0;
  color: #fff;
}
tbody tr:nth-child(odd) td input{
  background-color: #9493B0;
  color: #fff;
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
const dataType = "Select Data Type";

// Create an editable cell renderer
function EditableCell({
  value: initialValue, row: { index }, column: { id }, updateMyData, // This is a custom function that we supplied to our table instance
}) {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  const onChange = e => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input value={value} onChange={onChange} onBlur={onBlur} size={value.length} />;
}

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
    tableTitle,
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

function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
      (async () => {
        const result = await axios("http://localhost:3030/api/Drivers");
        setData(result.data);
      })();
    }, [dataType]);
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
            accessor: "HomePhone",
            Cell: ({ cell: { value } }) => <PhoneInput name="home phone" values={value} />
          },
          {
            Header: "Cell Phone",
            accessor: "CellPhone",
            Cell: ({ cell: { value } }) => <PhoneInput name="cell phone" values={value} />

          },
          {
            Header: "Email",
            accessor: "Email"
          },
          {
            Header: "Notes",
            accessor: "Notes"
          },
          {
            Header: "Save",
            accessor: "Save_me",
            Cell: ({ cell: { value } }) => <button>Save</button>
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
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          }
        }
        return row
      })
    )
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
      <Chooser dataType={dataType} choices={menuItems} />
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
