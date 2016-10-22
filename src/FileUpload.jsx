import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as firebase from 'firebase';
import assert from 'assert';
import events from './events';
import _ from 'lodash';

export default class FileUpload extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      files: []
    }
  }

  handleUpload(event) {
    let filesAsArray = _(event.target.files).values().value();
    this.setState({files: filesAsArray})
    this.props.onChange(filesAsArray);
  }

  render() {
    let previews = _(this.state.files)
      .map((f, i) => (
        <span key={i} className="file-preview">
          <img src={window.URL.createObjectURL(f)}
            />
        </span>
      ))
      .value()

    return (
      <div>
        <input type="file" multiple
          onChange={(e) => this.handleUpload(e)} />

        {previews}
      </div>
    )
  }
}
