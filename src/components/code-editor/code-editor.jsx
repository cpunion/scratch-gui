import React from 'react';
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";

import styles from "./code-editor.css";

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
    constructor(props) {
        super(props);
        this.state = {
            code: code,
            language: 'javascript',
        };
    }

    render() {
        return (
            <>
                {true && <Editor
                    height="90vh"
                    defaultLanguage="go"
                    defaultValue={code}
                    />}
            </>
        );
    }
}

export default CodeEditor;