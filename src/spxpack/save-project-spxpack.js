import JSZip from 'jszip';
import sb3 from "scratch-vm/src/serialization/sb3";
import {serializeSounds, serializeCostumes} from "scratch-vm/src/serialization/serialize-assets";
import {genDeclCode} from './spxpack';
import {genClassName, genSoundName} from './gen';

const DUMMY_GO_FILE = `package dummy

import (
	_ "github.com/goplus/gop"
	_ "github.com/goplus/spx"
)

`;

const GOP_MOD_FILE = `module mygame

go 1.16

require (
	github.com/goplus/spx v1.0.0-rc3.3
)
`;

function generateGmxFile(vm, project, stage, title) {
    const gmxDecl = genDeclCode(project, stage, false);
    const escapedTitle = title.replace(/"/, "\\\"");
    const footer = `

run "assets", {
    Title: "${escapedTitle} (by Go+ spx engine)",
    Width: ${vm.runtime.constructor.STAGE_WIDTH},
    Height: ${vm.runtime.constructor.STAGE_HEIGHT},
}
`;
    return gmxDecl + (stage.code || '') + footer;
}

function generateSpxFile(project, target) {
    return genDeclCode(project, target, false) + (target.code || '');
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

function saveSoundsToZip(target, soundDescs, zip) {
    const baseDir = 'assets/sounds';
    const soundDir = target.isStage ? `${baseDir}` : `${baseDir}`;
    console.log(target);
    for (const sound of target.sounds) {
        console.log(sound);
        const soundName = genSoundName(sound.name, target.name);

        const soundFileName = `${soundDir}/${soundName}/${sound.name}.${sound.dataFormat}`;
        const soundAssetFileName = `${sound.assetId}.${sound.dataFormat}`
        const soundDesc = soundDescs.find(s => s.fileName === soundAssetFileName);
        zip.file(soundFileName, soundDesc.fileContent);

        const manifestFileName = `${soundDir}/${soundName}/index.json`;
        const manifest = {
            path: `${sound.name}.${sound.dataFormat}`,
        };
        zip.file(manifestFileName, JSON.stringify(manifest, null, 4));
    }
}

function saveCostumesToZip(target, costumeDescs, zip) {
    const baseDir = 'assets/sprites';
    const spriteClassName = genClassName(target.name);
    const spriteName = target.isStage ? 'index' : `s${spriteClassName}`;
    const costumeDir = `${baseDir}/${spriteName}`;
    for (const costume of target.costumes) {
        const costumeFileName = `${costumeDir}/${costume.name}.${costume.dataFormat}`;
        const costumeAssetFileName = `${costume.assetId}.${costume.dataFormat}`
        const costumeDesc = costumeDescs.find(s => s.fileName === costumeAssetFileName);
        zip.file(costumeFileName, costumeDesc.fileContent);
    }
}

function saveSpriteJsonToZip(vm, project, target, sprites, zip) {
    const costumes = target.costumes.map(c => {
        let path = `${c.name}.${c.dataFormat}`;
        if (target.isStage) {
            path = `sprites/index/${path}`;
        }

        return {
            name: c.name,
            path,
            x: c.rotationCenterX,
            y: c.rotationCenterY,
            bitmapResolution: c.bitmapResolution,
        };
    });

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
        costumes,
    }

    if (target.isStage) {
        sprite["map"] = {
            width: vm.runtime.constructor.STAGE_WIDTH,
            height: vm.runtime.constructor.STAGE_HEIGHT
        };
        sprite["zorder"] = sprites.map(s => `s${genClassName(s.name)}`);
        const stageMonitors = project.monitors.filter(m => m.visible).map(m => ({
            type: "stageMonitor",
            target: "",
            val: `getVar:${m.params.VARIABLE}`,
            color: 15629590, // default color
            label: m.params.VARIABLE,
            mode: m.mode == "large" ? 2 : 1,
            x: m.x,
            y: m.y,
            visible: m.visible,
        }))
        sprite["zorder"] = [...sprite["zorder"], ...stageMonitors];
    }

    const spriteName = target.isStage ? 'index' : target.name;
    const spriteClassName = genClassName(spriteName);
    let fileName = `assets/sprites/s${spriteClassName}/index.json`;
    if (target.isStage) {
        fileName = 'assets/index.json';
    }
    zip.file(fileName, JSON.stringify(sprite, null, 4));
}

export function saveProjectSpxPack (vm, title) {
    const soundDescs = serializeSounds(vm.runtime);
    const costumeDescs = serializeCostumes(vm.runtime);
    const project = sb3.serialize(vm.runtime);

    // TODO want to eventually move zip creation out of here, and perhaps
    // into scratch-storage
    const zip = new JSZip();

    // Put everything in a zip file
    zip.file('go.mod', GOP_MOD_FILE);
    zip.file('dummy/dummy.go', DUMMY_GO_FILE);
    zip.file('project.json', JSON.stringify(project, null, 4));

    const sprites = project.targets.filter(t => !t.isStage);

    project.targets.forEach(target => {
        if (target.isStage) {
            const gmxFileContent = generateGmxFile(vm, project, target, title);
            zip.file('index.gmx', gmxFileContent);
        } else {
            const spriteClassName = genClassName(target.name);
            zip.file(`${spriteClassName}.spx`, generateSpxFile(project, target));
        }

        saveSoundsToZip(target, soundDescs, zip);
        saveCostumesToZip(target, costumeDescs, zip);
        saveSpriteJsonToZip(vm, project, target, sprites, zip);
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
