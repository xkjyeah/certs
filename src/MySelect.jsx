import Select from 'react-select';
import React from 'react';
import ReactDOM from 'react-dom';
import events from './events';

import 'react-select/dist/react-select.css';

export default class MySelect extends React.Component {
  constructor(props, what) {
    super(props, what);

    events.on('listsUpdated', (data) => {
      this.setState({
       options: data[this.props.source] || []
      })
    })

    this.state = {
      options: []
    }
  }
  render() {
    let selectProps = _.omit(this.props, ['source'])

    return (
      <Select options={this.state.options}
          {...selectProps} />
    )
  }
}
