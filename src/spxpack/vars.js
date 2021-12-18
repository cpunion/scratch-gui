import {
    genIdentifier
} from './gen';

function guessType(project, id) {
    return "float64";
}

export function genVariable(project, id, name, value) {
    const type = guessType(project, id);
    // return `\t${genIdentifier(name)} int${value === "" ? "" : ` = ${value}`}`;
    return `\t${genIdentifier(name)} ${type}`;
}

export function genList(project, id, name, value) {
    const list = JSON.stringify(value);
    // return `\t${genIdentifier(name)} = ${list}`;
    return `\t${genIdentifier(name)} List`;
}

export function genVarInit(project, id, name, value) {
    return `\t${genIdentifier(name)} = ${value}`;
}

export function genListInit(project, id, name, value) {
    const values = value.map(v => JSON.stringify(v)).join(', ');
    return `\t${genIdentifier(name)}.init(${values})`;
}
