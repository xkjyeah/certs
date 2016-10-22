import {Creatable} from 'react-select';
import React from 'react';
import ReactDOM from 'react-dom';
import events from './events';

import 'react-select/dist/react-select.css';

export default class MySelect extends React.Component {
  constructor(props, what) {
    super(props, what);

    this.state = {
      options: []
    }
  }
  componentDidMount() {
    events.on('listsUpdated', (data) => {
      this.setState({
       options: data[this.props.source].map(s => ({
         value: s,
         label: s
       })) || []
      })
    })
  }
  render() {
    let selectProps = _.omit(this.props, ['source', 'onChange']);
    let handleChange = (data) => {
      this.props.onChange(data.value)
    }

    function newOptionCreator({label, labelKey, value}) {
      return {
        label: label,
        value: label,
      }
    }
    function promptTextCreator(label) {
      return `Create "${label}"`;
    }

    return (
      <Creatable options={this.state.options}
          onChange={handleChange}
          newOptionCreator={newOptionCreator}
          promptTextCreator={promptTextCreator}
          {...selectProps} />
    )
  }
}
