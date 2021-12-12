export function genSpriteClassName(name) {
    const newName = genIdentifier(name);
    return newName[0].toUpperCase() + newName.slice(1);
}

export function genIdentifier(name) {
    return name.replace(/[ -\/\\;]/g, '');
}

export function genSoundName(name, sprite) {
    const spriteName = genIdentifier(sprite.name);
    const soundName = genIdentifier(name);
    return `${spriteName}_${soundName}`;
}

export function genDeclCode(target, targets, readOnly=true) {
    let decl = "";

    const sprites = targets.filter(t => !t.isStage).map(t => t.sprite).sort((a, b) => a < b ? -1 : 1);

    let spritesDef = [];
    if (target.isStage) {
        spritesDef = sprites.map(sprite => {
            const spriteName = genIdentifier(sprite.name);
            const spriteClassName = genSpriteClassName(sprite.name);
            return `\t${spriteName} ${spriteClassName}`;
        });
        const soundsDef = targets.map(target => {
            return (target.sprite.sounds || []).map(sound => {
                const soundName = genSoundName(sound.name, target.sprite);
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
