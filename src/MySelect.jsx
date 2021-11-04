import {Creatable} from 'react-select';
import React from 'react';
import { SingletonListsConsumer } from './events';

import 'react-select/dist/react-select.css';

export default class MySelect extends React.Component {
  constructor(props, what) {
    super(props, what);
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

    const optionsFromData = (data) => {
      return data.concat([this.props.value])
        .filter(x => x)
        .map(s => ({
          value: s,
          label: s
        }))
    }

    return (
      <SingletonListsConsumer source={this.props.source}>
        {({data}) => <Creatable options={optionsFromData(data)}
            onChange={handleChange}
            newOptionCreator={newOptionCreator}
            promptTextCreator={promptTextCreator}
            {...selectProps} />}
      </SingletonListsConsumer>
    )
  }
}
