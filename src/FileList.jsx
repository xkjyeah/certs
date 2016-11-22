import * as React from 'react';
import * as ReactDOM from 'react-dom';
import firebase from 'firebase';
import FileUpload from './FileUpload.jsx';

export default class FileList extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      files: props.files || [],
      deletedFiles: [],
      newFiles: []
    }
    this.oldFiles = props.files;
  }

  componentWillReceiveProps({files}) {
    if (this.oldFiles == files)
      return;

    this.oldFiles = files;
    this.setState({files, deletedFiles: []})
  }

  stageDelete(whichFile) {
    let deletedFiles = this.state.deletedFiles.concat([whichFile])

    this.setState({
      files: this.state.files.filter(x => x.key != whichFile.key),
      deletedFiles
    })
    this.props.onChange && this.props.onChange(
      this.state.newFiles, deletedFiles
    )

    setTimeout(() => console.log(this.state.files), 1000);
  }

  stageAdd(files) {
    this.setState({
      newFiles: files
    })
    this.props.onChange && this.props.onChange(
      files, this.state.deletedFiles
    )
  }

  render() {
    let fileViews = _(this.state.files)
      .values()
      .map((f) => (
        <FileView key={f.key} file={f}
          onDelete={() => this.stageDelete(f)} />
      ))
      .sortBy('createdAt')
      .value();

    let fileUpload = [
      <FileUpload key={this.props.refreshFile}
        onChange={(e) => this.stageAdd(e)} />
    ]

    return (
      <div className="file-list">
        {fileViews}

        <label className="form-inline">
          Upload files here:
          {fileUpload}
        </label>
      </div>
    )
  }
}

class FileView extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      imageUrl: false,
      isImage: false,
    }
  }

  componentDidMount() {
    var fileRef = firebase.storage().ref(this.props.file.storageRef)

    fileRef.getMetadata().then((metadata) => {
      if (metadata.contentType.startsWith('image/')) {
        this.setState({isImage: true});
      } else {
        this.setState({isImage: false});
      }
    })

    fileRef.getDownloadURL()
      .then(url =>
        this.setState({imageUrl: url})
      )
      .catch(err =>
        this.setState({imageUrl: null}))
  }

  onDelete() {
    if (confirm("Are you sure you want to delete this file?")) {
      this.props.onDelete && this.props.onDelete()
    }
  }

  render() {
    const deleteButton = (
      <button type="button"
        className="glyphicon glyphicon-trash btn btn-default"
        onClick={() => this.onDelete()}
        ></button>
    );
    return this.state.imageUrl ? (
      <span className="uploaded-image">
        <a href={this.state.imageUrl} target="_blank">
          {this.state.isImage ? <img src={this.state.imageUrl} alt="Loading..." />
        : <span className="view-button">View...</span>}
        </a>
        {deleteButton}
      </span>
    ) :
    (this.state.imageUrl === null) ? (<span>Error loading image. {deleteButton}</span>) :
    (<span>Loading image...</span>)
  }
}
