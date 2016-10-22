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
import classnames from 'classnames';

import 'react-datepicker/dist/react-datepicker.css';

export var CertsForm = React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState() {
    return {
      data: {
        id: '',
        employee: '',
        certificate: '',
        startDate: null,
        endDate: null,
      },
      shown: false
    }
  },
  componentDidMount() {
    events.on('requestEdit', (certEntry) => {
      this.setState({
        data: certEntry,
        shown: true
      })
    });
  },
  save(event) {
    var id = this.state.data.id || firebase.database().ref(`certificates`).push().key

    var serialized = {
      id,
      employee: this.state.data.employee,
      certificate: this.state.data.certificate,
      startDate: this.state.data.startDate.format(),
      endDate: this.state.data.endDate.format(),
    };

    assert(id, "ID is empty!")

    let savePromise = firebase.database().ref(`certificates/${id}`)
      .set(serialized)

    // console.log(serialized)

    savePromise.then(this.props.onSave);
    savePromise.then(() => this.dismiss());
  },
  delete(event) {
    var id = this.state.data.id;

    assert(id, "Cannot delete empty ID")

    let deletePromise = firebase.database().ref(`certificates/${id}`).remove()

    deletePromise.then(this.props.onSave)
    deletePromise.then(() => this.dismiss())
  },
  dismiss() {
    this.setState({shown: false});
  },
  setData(newData) {
    return this.setState({
      data: _.assign({}, this.state.data, newData)
    })
  },
  handleChange(field) {
    return (date) => {
      this.setData(
        _.fromPairs([
          [field, date]
        ])
      )
    }
  },
  adjustDate(number, unit) {
    return () => {
      var ref = this.state.data.endDate || this.state.data.startDate || moment();

      ref = ref.clone();
      ref.add(number, unit);
      this.setData({
        endDate: ref
      })
    }
  },
  render() {
    let backdropClasses = classnames({
      backdrop: true,
      show: this.state.shown
    })

    return (
      <div className={backdropClasses}>
        <form className="certs-form">
          <input type="hidden" value={this.state.data.id} />
          <label className="form-inline">
            Employee
            <MySelect
              source="employees"
              value={this.state.data.employee}
              onChange={this.handleChange('employee')}
              />
          </label>
          <label className="form-inline">
            Certificate
            <MySelect
              source="certificates"
              value={this.state.data.certificate}
              onChange={this.handleChange('certificate')}
              />
          </label>
          <label className="form-inline">
            Validity
            <DatePicker selected={this.state.data.startDate}
              onChange={this.handleChange('startDate')}
              />
          </label>
          <label className="form-inline">
            Expiry
            <DatePicker selected={this.state.data.endDate}
              onChange={this.handleChange('endDate')}
              />
          </label>
          <table>
            <tbody>
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
            </tbody>
          </table>

          <label className="form-inline">
            Upload files here:
            <input type="file" multiple  />
          </label>

          <button type="button" onClick={this.save} className="btn btn-primary">Save</button>
          <button type="button" onClick={this.dismiss} className="btn btn-default">Cancel</button>

          <hr/>
          <button type="button" onClick={this.delete}
            disabled={this.state.id ? false : true}
            className="btn btn-danger">Delete</button>
        </form>
      </div>
    )
  }
})
