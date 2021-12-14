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

export function genDeclCode(target, sprites, isStage, readOnly=true) {
    let decl = "";

    let spritesDef = [];
    if (isStage) {
        spritesDef = sprites.map(sprite => {
            const spriteName = genIdentifier(sprite.name);
            const spriteClassName = genSpriteClassName(sprite.name);
            return `\t${spriteName} ${spriteClassName}`;
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

    if (decl.length > 0) {
        if (readOnly) {
            decl =
`// Don't edit this block, it's generated automatically.
var (
${decl})
// End block.
`;
        } else {
            decl =
`var (
${decl})
`;
        }
    }
    
    return decl;
}
