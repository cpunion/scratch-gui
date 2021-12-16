import React from 'react';
import PropTypes from 'prop-types';
import VM from 'scratch-vm';
import sb3 from "scratch-vm/src/serialization/sb3";

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
        const declCode = this._getDeclCode(this.props.vm.editingTarget);
        code = code.substr(declCode.length);

        this.props.vm.setCode(code);
    };

    onMount = (editor) => {
        const declCode = this._getDeclCode(this.props.vm.editingTarget);
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

    _getDeclCode(target) {
        const {runtime} = this.props.vm;
        const targetObj = sb3.serialize(runtime, target.id)
        let sprites = [];
        if (targetObj.isStage) {
            // hacking for performance
            sprites = runtime.targets.filter(t => !t.isStage).map(t => ({
                name: t.sprite.name,
                sounds: t.getSounds(),
            })).sort((a, b) => a.name.localeCompare(b.name));
        }
        return genDeclCode(targetObj, sprites, target.isStage)
    }

    getCode(target) {
        const declCode = this._getDeclCode(target);
        const code = target.code || '';
        return declCode + code;
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
