import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';
import downloadBlob from '../lib/download-blob';
import {saveProjectSpxPack} from './save-project-spxpack';

/**
 * Project saver component passes a downloadProject function to its child.
 * It expects this child to be a function with the signature
 *     function (downloadProject, props) {}
 * The component can then be used to attach project saving functionality
 * to any other component:
 *
 * <SpxDownloader>{(downloadProject, props) => (
 *     <MyCoolComponent
 *         onClick={downloadProject}
 *         {...props}
 *     />
 * )}</SpxDownloader>
 */
class SpxPackDownloader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'downloadProject'
        ]);
    }
    downloadProject () {
        this.props.saveProjectSpx(this.props.projectTitle).then(content => {
            if (this.props.onSaveFinished) {
                this.props.onSaveFinished();
            }
            downloadBlob(this.props.projectFilename, content);
        });
    }
    render () {
        const {
            children
        } = this.props;
        return children(
            this.props.className,
            this.downloadProject
        );
    }
}

const getProjectFilename = (curTitle, defaultTitle) => {
    let filenameTitle = curTitle;
    if (!filenameTitle || filenameTitle.length === 0) {
        filenameTitle = defaultTitle;
    }
    return `${filenameTitle.substring(0, 100)}.spxpack.zip`;
};

SpxPackDownloader.propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    onSaveFinished: PropTypes.func,
    projectFilename: PropTypes.string,
    saveProjectSpx: PropTypes.func
};
SpxPackDownloader.defaultProps = {
    className: ''
};

const mapStateToProps = state => ({
    saveProjectSpx: () => saveProjectSpxPack(state.scratchGui.vm, state.scratchGui.projectTitle),
    projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState),
});

export default connect(
    mapStateToProps,
    () => ({}) // omit dispatch prop
)(SpxPackDownloader);
