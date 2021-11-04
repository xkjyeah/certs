import * as React from 'react';
import * as firebaseStorage from 'firebase/storage';
import FileUpload from './FileUpload.jsx';

export default class FileList extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.storage = firebaseStorage.getStorage()

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

  stageDelete = (whichFile) => {
    let deletedFiles = this.state.deletedFiles.concat([whichFile])

    this.setState({
      files: this.state.files.filter(x => x.key != whichFile.key),
      files2: this.state.files.filter(x => x.key != whichFile.key),
      deletedFiles
    })
    this.props.onChange && this.props.onChange(
      this.state.newFiles, deletedFiles
    )

    setTimeout(() => console.log(this.state.files), 1000);
  }

  stageAdd = (files) => {
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
    this.storage = firebaseStorage.getStorage()
    this.state = {
      imageUrl: false,
      isImage: false,
      metadata: null,
    }
  }

  componentDidMount() {
    const fileRef = firebaseStorage.ref(this.storage, this.props.file.storageRef)

    firebaseStorage.getMetadata(fileRef).then((metadata) => {
      this.setState({metadata})
      if (metadata.contentType.startsWith('image/')) {
        this.setState({isImage: true});
      } else {
        this.setState({isImage: false});
      }
    })

    firebaseStorage.getDownloadURL(fileRef)
      .then(url => {
        this.setState({imageUrl: url})
      })
      .catch(err => {
        console.error(err)
        this.setState({imageUrl: null})
      })
  }

  onDelete = () => {
    if (confirm("Are you sure you want to delete this file?")) {
      this.props.onDelete && this.props.onDelete()
    }
  }

  suggestedUrl = () => {
    return 'test.bin';
  }

  render() {
    const deleteButton = (
      <button type="button"
        className="glyphicon glyphicon-trash btn btn-default"
        onClick={() => this.onDelete()}
        ></button>
    );

    if (this.state.imageUrl) {
      return <span className="uploaded-image">
        <a href={this.state.imageUrl} target="_blank" download={this.suggestedUrl()}>
          {this.state.isImage ? <img src={this.state.imageUrl} alt="Loading..." />
          : <span className="view-button">View...</span>}
        </a>
        {deleteButton}
      </span>
    } else if (this.state.imageUrl === null) {
      return <span>Error loading image. {deleteButton}</span>
    } else {
      return <span>Loading image...</span>;
    }
  }
}
