import JSZip from 'jszip';

import { genDeclCode, genSpriteClassName, genSoundName, genIdentifier } from './spxpack';

const DUMMY_GO_FILE = `package dummy

import (
	_ "github.com/goplus/gop"
	_ "github.com/goplus/spx"
)

`;

const GOP_MOD_FILE = `module mygame

go 1.16

require (
	github.com/goplus/spx v1.0.0-rc3
)

replace github.com/goplus/spx v1.0.0-rc3 => github.com/sunqirui1987/spx v0.9.9-0.20211212035250-0c52c4e99274
`;

function generateGmxFile(stage, targets, title) {
    const gmxDecl = genDeclCode(stage, targets, false);
    const escapedTitle = title.replace(/"/, "\\\"");
    const footer = `
run "assets", {
    Title: "${escapedTitle} (by Go+ spx engine)",
    Width: ${stage.runtime.constructor.STAGE_WIDTH},
    Height: ${stage.runtime.constructor.STAGE_HEIGHT},
}
`;
    return gmxDecl + (stage.sprite.code || '') + footer;
}

function generateSpxFile(target, targets) {
    return genDeclCode(target, targets, false) + (target.sprite.code || '');
}

function genBlankImageBytes(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    return canvas.getImageData(0, 0, width, height).data;
}

function saveSoundsToZip(target, zip) {
    const baseDir = 'assets/sounds';
    const soundDir = target.isStage ? `${baseDir}` : `${baseDir}`;
    for (const sound of target.sprite.sounds) {
        const soundName = genSoundName(sound.name, target.sprite);

        const soundFileName = `${soundDir}/${soundName}/${sound.name}.${sound.dataFormat}`;
        zip.file(soundFileName, sound.asset.data);

        const manifestFileName = `${soundDir}/${soundName}/index.json`;
        const manifest = {
            path: `${sound.name}.${sound.dataFormat}`,
        };
        zip.file(manifestFileName, JSON.stringify(manifest, null, 4));
    }
}

function saveCostumesToZip(target, zip) {
    const baseDir = 'assets/sprites';
    const spriteName = target.isStage ? 'index' : target.sprite.name;
    const spriteClassName = genSpriteClassName(spriteName);
    const costumeDir = `${baseDir}/${spriteClassName}`;
    for (const costume of target.sprite.costumes) {
        const fileName = `${costumeDir}/${costume.name}.${costume.dataFormat}`;
        zip.file(fileName, costume.asset.data);
    }
}

function saveSpriteJsonToZip(target, sprites, zip) {
    console.log(target);

    const sprite = {
        currentCostumeIndex: target.currentCostume,
        costumeIndex: target.currentCostume,
        heading: target.direction,
        isDraggable: target.draggable,
        rotationStyle: "normal",
        size: target.size / 100.0,
        visible: target.visible,
        x: target.x,
        y: target.y,
        costumes: target.sprite.costumes.map(c => {
            let path = `${c.name}.${c.dataFormat}`;
            if (target.isStage) {
                path = `sprites/index/${path}`;
            }

            return {
                name: c.name,
                path,
                x: c.rotationCenterX,
                y: c.rotationCenterY,
            };
        })
    }

    if (target.isStage) {
        sprite["map"] = {
            width: target.runtime.constructor.STAGE_WIDTH,
            height: target.runtime.constructor.STAGE_HEIGHT
        };
        sprite["zorder"] = sprites.map(s => genSpriteClassName(s.sprite.name));
    }

    const spriteName = target.isStage ? 'index' : target.sprite.name;
    const spriteClassName = genSpriteClassName(spriteName);
    let fileName = `assets/sprites/${spriteClassName}/index.json`;
    if (target.isStage) {
        fileName = 'assets/index.json';
    }
    zip.file(fileName, JSON.stringify(sprite, null, 4));
}

/**
 * @returns {string} Project in a Scratch 3.0 Spx JSON representation.
 */
export function saveProjectSpxPack (vm, title) {
    console.log('Saving project as Spx Pack');

    // TODO want to eventually move zip creation out of here, and perhaps
    // into scratch-storage
    const zip = new JSZip();

    // Put everything in a zip file
    zip.file('go.mod', GOP_MOD_FILE);
    zip.file('dummy/dummy.go', DUMMY_GO_FILE);

    const stage = vm.runtime.getTargetForStage();
    const targets = vm.runtime.targets;
    const sprites = targets.filter(t => !t.isStage);

    vm.runtime.targets.forEach(target => {
        if (target.isStage) {
            const gmxFileContent = generateGmxFile(stage, targets, title);
            zip.file('index.gmx', gmxFileContent);
        } else {
            const spriteClassName = genSpriteClassName(target.sprite.name);
            zip.file(`${spriteClassName}.spx`, generateSpxFile(target, targets));
        }

        saveSoundsToZip(target, zip);
        saveCostumesToZip(target, zip);
        saveSpriteJsonToZip(target, sprites, zip);
    });

    return zip.generateAsync({
        type: 'blob',
        mimeType: 'application/x.scratch.spxpack',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 6 // Tradeoff between best speed (1) and best compression (9)
        }
    });
}
