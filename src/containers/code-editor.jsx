import React from 'react';
import PropTypes from 'prop-types';
import VM from 'scratch-vm';

import {injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';

import Editor from '../components/code-editor/code-editor.jsx';

import {genDeclCode} from '../spxpack/spxpack';

const code = `var (
    health = 100
)

onStart => {
    for {
        step 10
        wait 0.1
    }
}

onTouched => {
    health = health - 10
}
`

class CodeEditor extends React.Component {
    onChange = (code, e) => {
        const {editingTarget, runtime} = this.props.vm;
        const decl = genDeclCode(editingTarget, runtime.targets);
        code = code.substr(decl.length);

        this.props.vm.setCode(code);
    };

    onMount = (editor) => {
        const {editingTarget, runtime} = this.props.vm;

        const declCode = genDeclCode(editingTarget, runtime.targets);
        const lineCount = declCode.split('\n').length;

        editor.onDidChangeCursorPosition((e) => {
            if (e.position.lineNumber < lineCount) {
                editor.setPosition({
                    lineNumber:lineCount,
                    column: 1
                });
            }
        });
    }

    getCode(target) {
        const code = target.sprite.code || '';
        return genDeclCode(target, this.props.vm.runtime.targets) + code;
    }

    render() {
        const {vm, editingTarget} = this.props;
        if (!vm.editingTarget) {
            return null;
        }
        
        const target = vm.editingTarget;
        const {sprite} = target;
        const code = this.getCode(target);

        return (
            <>
                <Editor key={editingTarget}
                    height="90vh"
                    defaultLanguage={sprite.language || 'go'}
                    defaultValue={code}
                    language={sprite.language || 'go'}
                    value={code}
                    onChange={this.onChange}
                    onMount={this.onMount}
                    />
            </>
        );
    }
}

const mapStateToProps = state => ({
    editingTarget: state.scratchGui.targets.editingTarget,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage,
});

CodeEditor.propTypes = {
    vm: PropTypes.instanceOf(VM).isRequired,
};

CodeEditor.defaultProps = {

};

export default errorBoundaryHOC('Code Editor')(
    injectIntl(connect(
        mapStateToProps,
        // mapDispatchToProps
    )(CodeEditor))
);
