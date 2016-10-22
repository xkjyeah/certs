import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as LinkedStateMixin from 'react-addons-linked-state-mixin';
import * as firebase from 'firebase';
import assert from 'assert';
import events from './events';
import _ from 'lodash';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import MySelect from './MySelect.jsx';

export var CertsForm = React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState() {
    events.on('requestEdit', (certEntry) => {
      this.setState(certEntry)
    });

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

    var serialized = {
      id,
      employee: this.state.employee,
      certificate: this.state.certificate,
      startDate: this.state.startDate.toString(),
      endDate: this.state.endDate.toString(),
    };

    assert(id, "ID is empty!")

    firebase.database().ref(`certificates/${id}`)
      .set(serialized)
      .then(this.props.onSave);
  },
  delete(event) {
    var id = this.state.id;

    assert(id, "Cannot delete empty ID")

    firebase.database().ref(`certificates/${id}`).remove()
      .then(this.props.onSave)
  },
  handleChange(field) {
    return (date) => {
      this.setState(_.fromPairs([
        [field, date]
      ]))
    }
  },
  adjustDate(number, unit) {
    return () => {
      var ref = this.state.endDate || this.state.startDate || moment();

      ref = ref.clone();
      ref.add(number, unit);
      this.setState({
        endDate: ref
      })
    }
  },
  render() {
    return (
      <form className="certs-form">
        <input type="hidden" value={this.state.id} />
        <label className="form-inline">
          Employee
          <MySelect
            source="employees"
            value={this.state.employee}
            onChange={this.handleChange('employee')}
            />
        </label>
        <label className="form-inline">
          Certificate
          <MySelect
            source="certificates"
            value={this.state.certificate}
            onChange={this.handleChange('certificate')}
            />
        </label>
        <label className="form-inline">
          Validity
          <DatePicker selected={this.state.startDate}
            onChange={this.handleChange('startDate')}
            />
        </label>
        <label className="form-inline">
          Expiry
          <DatePicker selected={this.state.endDate}
            onChange={this.handleChange('endDate')}
            />
        </label>
        <table>
          <tr>
            <td><button type="button" onClick={this.adjustDate(1, 'year')}>+年</button></td>
            <td><button type="button" onClick={this.adjustDate(1, 'month')}>+月</button></td>
            <td><button type="button" onClick={this.adjustDate(1, 'day')}>+日</button></td>
          </tr>
          <tr>
            <td><button type="button" onClick={this.adjustDate(-1, 'year')}>-年</button></td>
            <td><button type="button" onClick={this.adjustDate(-1, 'month')}>-月</button></td>
            <td><button type="button" onClick={this.adjustDate(-1, 'day')}>-日</button></td>
          </tr>
        </table>

        <label className="form-inline">
          Upload files here:
          <input type="file" multiple  />
        </label>

        <button type="button" onClick={this.save} className="btn btn-default">Save</button>

        <hr/>
        <button type="button" onClick={this.delete}
          disabled={this.state.id ? false : true}
          className="btn btn-danger">Delete</button>
      </form>
    )
  }
})
