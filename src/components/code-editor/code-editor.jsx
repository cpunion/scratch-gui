import React from 'react';
import PropTypes from 'prop-types';
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";

const CodeEditor = props => {
    return (
        <>
            <Editor {...props} />
        </>
    );
}


CodeEditor.propTypes = {
    height: PropTypes.string,
    defaultLanguage: PropTypes.string,
    defaultValue: PropTypes.string,
    language: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
};

CodeEditor.defaultProps = {
    defaultLanguage: 'go',
};


export default CodeEditor;