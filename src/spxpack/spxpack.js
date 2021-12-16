export function genSpriteClassName(name) {
    const newName = genIdentifier(name);
    return newName[0].toUpperCase() + newName.slice(1);
}

export function genIdentifier(name) {
    return name.replace(/[ -\/\\;]/g, '');
}

export function genSoundName(name, spriteName) {
    return `${genIdentifier(spriteName)}_${genIdentifier(name)}`;
}

function genVariable(id, name, value) {
    // return `\t${genIdentifier(name)} int${value === "" ? "" : ` = ${value}`}`;
    return `\t${genIdentifier(name)} float64`;
}

function genList(id, name, value) {
    const list = JSON.stringify(value);
    // return `\t${genIdentifier(name)} = ${list}`;
    return `\t${genIdentifier(name)} []interface{}`;
}

function genVarInit(id, name, value) {
    return `\t${genIdentifier(name)} = ${value}`;
}

function genListInit(id, name, value) {
    const values = value.map(v => JSON.stringify(v)).join(', ');
    return `\t${genIdentifier(name)} = []interface{}{${values}}`;
}

export function genDeclCode(target, sprites, isStage, readOnly=true) {
    let decl = "";

    let spritesDef = [];
    if (isStage) {
        spritesDef = sprites.map(sprite => {
            const spriteName = genIdentifier(sprite.name);
            const spriteClassName = genSpriteClassName(sprite.name);
            return `\ts${spriteName} ${spriteClassName}`;
        });
        const soundsDef = [target, ...sprites].map(target => {
            return (target.sounds || []).map(sound => {
                const soundName = genSoundName(sound.name, target.name);
                return `\t${soundName} Sound`
            });
        }).flat();

        if (spritesDef.length > 0) {
            decl += `${spritesDef.join("\n")}\n`;
        }
        if (soundsDef.length > 0) {
            decl += `\n${soundsDef.join("\n")}\n`;
        }
    }

    const vars = Object.entries(target.variables).map(([id, value]) => {
        return genVariable(id, value[0], value[1]);
    });
    if (vars.length > 0) {
        decl += `\n${vars.join("\n")}\n`;
    }

    const lists = Object.entries(target.lists).map(([id, value]) => {
        return genList(id, value[0], value[1]);
    });
    if (lists.length > 0) {
        decl += `\n${lists.join("\n")}\n`;
    }

    const varInits = Object.entries(target.variables).filter(([id, value]) => value[1] != "").map(([id, value]) => {
        return genVarInit(id, value[0], value[1]);
    });
    const listInits = Object.entries(target.lists).filter(([id, value]) => value[1] != "").map(([id, value]) => {
        return genListInit(id, value[0], value[1]);
    });
    let initializers = [...varInits, ...listInits];
    if (initializers.length > 0) {
        initializers = `\nfunc OnLoaded() {\n${initializers.join("\n")}\n}\n`;
    }

    if (decl.length > 0) {
        decl = `var(\n${decl}\n)`;
    }
    if (initializers.length > 0) {
        decl += initializers
    }

    if (decl.length > 0) {
        if (readOnly) {
            decl =
`// Don't edit this block, it's generated automatically.
${decl}
// End block.
`;
        }
    }
    
    return decl;
}
