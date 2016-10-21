import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as LinkedStateMixin from 'react-addons-linked-state-mixin';
import * as firebase from 'firebase';
import assert from 'assert';

export var CertsForm = React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState() {
    return {
      id: '',
      employee: '',
      certificate: '',
      startDate: '',
      endDate: '',
    }
  },
  save(event) {
    var id = this.state.id || firebase.database().ref(`certificates`).push().key
    console.log(this.state);

    assert(id, "ID is empty!")

    firebase.database().ref(`certificates/${id}`).set(this.state)

    this.props.onSave && this.props.onSave();
  },
  render() {
    return (
      <form>
        <input type="hidden" value={this.state.id} />
        <label>
          Employee
          <input type="text" valueLink={this.linkState('employee')} />
        </label>
        <label>
          Certificate
          <input type="text" valueLink={this.linkState('certificate')} />
        </label>
        <label>
          Validity
          <input type="date" valueLink={this.linkState('startDate')} />
        </label>
        <label>
          Expiry
          <input type="date" valueLink={this.linkState('endDate')} />
        </label>

        <label>
          Upload files here:
          <input type="file" multiple />
        </label>

        <button type="button" onClick={this.save}>Save</button>
      </form>
    )
  }
})
