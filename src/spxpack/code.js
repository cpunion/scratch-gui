import { genIdentifier, genSoundName, genClassName } from "./gen";
import sb3 from "scratch-vm/src/serialization/sb3";

const blocks = {
    argument_reporter_string_number(project, target, block) {
        return block.fields.VALUE[0];
    },

    control_repeat_until(project, target, block){
        return {
            [`for !${genInput(project, target, block.inputs.CONDITION)}`]: genInput(project, target, block.inputs.SUBSTACK),
        };
    },

    control_wait(project, target, block){
        return `wait(${genInput(project, target, block.inputs.DURATION)})`
    },

    control_if(project, target, block){
        return {
            [`if ${genInput(project, target, block.inputs.CONDITION)}`]: genInput(project, target, block.inputs.SUBSTACK),
        };
    },

    control_if_else(project, target, block){
        return [
            {
                [`if ${genInput(project, target, block.inputs.CONDITION)}`]: genInput(project, target, block.inputs.SUBSTACK),
                'else': genInput(project, target, block.inputs.SUBSTACK2),
            },
        ];
    },

    control_repeat(project, target, block){
        return {
            [`for i <- :${genInput(project, target, block.inputs.TIMES)}`]: genInput(project, target, block.inputs.SUBSTACK),
        };
    },

    control_forever(project, target, block){
        return {
            'for': genInput(project, target, block.inputs.SUBSTACK),
        };
    },

    control_delete_this_clone(project, target, block){
        return 'destroy';
    },

    control_start_as_clone(project, target, block){
        return {
            'onCloned =>': genFuncOrEvent(project, target, target.blocks[block.next]),
        };
    },

    control_create_clone_of(project, target, block){
        return genInput(project, target, block.inputs.CLONE_OPTION);
    },

    control_create_clone_of_menu(project, target, block){
        const sprite = block.fields.CLONE_OPTION[0];
        if (sprite === '_myself_') {
            return 'clone';
        } else {
            return `clone(${genClassName(sprite)})`;
        }
    },

    control_wait_until(project, target, block){
        return `for !(${genInput(project, target, block.inputs.CONDITION)}) {}`;
    },

    event_whenbackdropswitchesto(project, target, block){
        const backdropName = JSON.stringify(block.fields.BACKDROP[0]);
        return {
            [`onScene ${backdropName}, =>`]: genFuncOrEvent(project, target, target.blocks[block.next]),
        };
    },

    event_whenflagclicked(project, target, block){
        return {
            'onStart =>': genFuncOrEvent(project, target, target.blocks[block.next])
        };
    },

    event_whenbroadcastreceived(project, target, block){
        const broadcastName = JSON.stringify(block.fields.BROADCAST_OPTION[0]);
        return {[`onMsg ${broadcastName}, =>`]: genFuncOrEvent(project, target, target.blocks[block.next])};
    },

    event_whenstageclicked(project, target, block){
        return {
            'onClick =>': genFuncOrEvent(project, target, target.blocks[block.next])
        };
    },

    event_whenthisspriteclicked(project, target, block){
        return {
            'onClick =>': genFuncOrEvent(project, target, target.blocks[block.next])
        };
    },

    event_broadcast(project, target, block){
        return `broadcast(${genInput(project, target, block.inputs.BROADCAST_INPUT)})`;
    },

    event_broadcastandwait(project, target, block){
        return `broadcast(${genInput(project, target, block.inputs.BROADCAST_INPUT)}, true)`;
    },

    looks_switchbackdropto(project, target, block){
        return `startScene(${genInput(project, target, block.inputs.BACKDROP)})`;
    },

    looks_backdrops(project, target, block){
        return JSON.stringify(block.fields.BACKDROP[0]);
    },

    looks_backdropnumbername(project, target, block){
        const nameOrIndex = block.fields.NUMBER_NAME[0];
        if (nameOrIndex === 'name') {
            return "sceneName";
        } else {
            return "sceneIndex";
        }
    },

    looks_switchcostumeto(project, target, block){
        return `startScene(${genInput(project, target, block.inputs.COSTUME)})`;
    },

    looks_nextcostume(project, target, block){
        return 'nextScene';
    },

    looks_costume(project, target, block){
        return JSON.stringify(block.fields.COSTUME[0]);
    },

    looks_seteffectto(project, target, block){
        return `setEffect(${genEffect(block.fields.EFFECT[0])}, ${genInput(project, target, block.inputs.VALUE)})`;
    },

    looks_changeeffectby(project, target, block){
        return `changeEffect(${genEffect(block.fields.EFFECT[0])}, ${genInput(project, target, block.inputs.CHANGE)})`;
    },

    data_hidevariable(project, target, block){
        return `hideVar(${JSON.stringify(block.fields.VARIABLE[0])})`;
    },

    data_showvariable(project, target, block){
        return `showVar(${JSON.stringify(block.fields.VARIABLE[0])})`;
    },

    data_setvariableto(project, target, block){
        return `${genIdentifier(block.fields.VARIABLE[0])} = ${genInput(project, target, block.inputs.VALUE)}`;
    },

    data_changevariableby(project, target, block){
        return `${genIdentifier(block.fields.VARIABLE[0])} += ${genInput(project, target, block.inputs.VALUE)}`;
    },
    
    data_deleteoflist(project, target, block){
        return `${genIdentifier(block.fields.LIST[0])}.delete(${toListIndex(genInput(project, target, block.inputs.INDEX))})`;
    },

    data_addtolist(project, target, block){
        return `${genIdentifier(block.fields.LIST[0])}.append(${genInput(project, target, block.inputs.ITEM)})`;
    },

    data_itemoflist(project, target, block){
        return `${genIdentifier(block.fields.LIST[0])}.at(${genInput(project, target, block.inputs.INDEX)})`;
    },

    data_replaceitemoflist(project, target, block){
        return `${genIdentifier(block.fields.LIST[0])}.set(${genInput(project, target, block.inputs.INDEX)}, ${genInput(project, target, block.inputs.ITEM)})`;
    },

    data_lengthoflist(project, target, block){
        return `${genIdentifier(block.fields.LIST[0])}.len`;
    },

    motion_glidesecstoxy(project, target, block){
        return `glide(${genInput(project, target, block.inputs.X)}, ${genInput(project, target, block.inputs.Y)}, ${genInput(project, target, block.inputs.SECS)})`;
    },

    motion_gotoxy(project, target, block){
        return `setXYpos(${genInput(project, target, block.inputs.X)}, ${genInput(project, target, block.inputs.Y)})`;
    },

    motion_xposition(project, target, block){
        return `xpos`;
    },

    motion_yposition(project, target, block){
        return `ypos`;
    },

    motion_movesteps(project, target, block){
        return `step ${genInput(project, target, block.inputs.STEPS)}`;
    },

    sound_stopallsounds(project, target, block){
        return `stopAllSounds`;
    },

    sound_playuntildone(project, target, block){
        return `play(${genInput(project, target, block.inputs.SOUND_MENU)}, true)`;
    },

    sound_sounds_menu(project, target, block){
        return genSoundName(block.fields.SOUND_MENU[0], target.name);
    },

    looks_show(project, target, block){
        return 'show';
    },

    looks_hide(project, target, block){
        return 'hide';
    },

    looks_gotofrontback(project, target, block){
        const layer = block.fields.FRONT_BACK[0];
        let fun = '';
        switch (layer) {
            case 'front': fun = 'gotoFront'; break;
            case 'back': fun = 'gotoBack'; break;
            default: fun = `goBackLayers ${layer}`; break;
        }
        return fun;
    },

    looks_sayforsecs(project, target, block){
        return `say(${genInput(project, target, block.inputs.MESSAGE)}, ${genInput(project, target, block.inputs.SECS)})`;
    },

    motion_goto(project, target, block){
        return `goto(${genInput(project, target, block.inputs.TO)})`;
    },

    motion_goto_menu(project, target, block){
        let targetObj = '';
        switch (block.fields.TO[0]) {
            case '_mouse_': targetObj = 'Mouse'; break;
            case '_random_': targetObj = 'Mouse'; break;
            default: targetObj = block.fields.TO[0]; break;
        }

        return targetObj;
    },

    operator_not(project, target, block){
        return `!${genInput(project, target, block.inputs.OPERAND)}`;
    },

    operator_and(project, target, block){
        const left = genInput(project, target, block.inputs.OPERAND1);
        const right = genInput(project, target, block.inputs.OPERAND2);
        return `(${left} && ${right})`;
    },

    operator_or(project, target, block){
        const left = genInput(project, target, block.inputs.OPERAND1);
        const right = genInput(project, target, block.inputs.OPERAND2);
        return `(${left} || ${right})`;
    },

    operator_equals(project, target, block){
        const left = genInput(project, target, block.inputs.OPERAND1);
        const right = genInput(project, target, block.inputs.OPERAND2);
        return `(${left} == ${right})`;
    },

    operator_lt(project, target, block){
        const left = genInput(project, target, block.inputs.OPERAND1);
        const right = genInput(project, target, block.inputs.OPERAND2);
        return `(${left} < ${right})`;
    },

    operator_gt(project, target, block){
        const left = genInput(project, target, block.inputs.OPERAND1);
        const right = genInput(project, target, block.inputs.OPERAND2);
        return `(${left} > ${right})`;
    },

    operator_add(project, target, block){
        const left = genInput(project, target, block.inputs.NUM1);
        const right = genInput(project, target, block.inputs.NUM2);
        return `(${left} + ${right})`;
    },

    operator_subtract(project, target, block){
        const left = genInput(project, target, block.inputs.NUM1);
        const right = genInput(project, target, block.inputs.NUM2);
        return `(${left} - ${right})`;
    },

    operator_multiply(project, target, block){
        const left = genInput(project, target, block.inputs.NUM1);
        const right = genInput(project, target, block.inputs.NUM2);
        return `(${left} * ${right})`;
    },

    operator_divide(project, target, block){
        const left = genInput(project, target, block.inputs.NUM1);
        const right = genInput(project, target, block.inputs.NUM2);
        return `(${left} / ${right})`;
    },

    operator_mod(project, target, block){
        const left = genInput(project, target, block.inputs.NUM1);
        const right = genInput(project, target, block.inputs.NUM2);
        return `(${left} % ${right})`;
    },

    operator_mathop(project, target, block){
        return `${block.fields.OPERATOR[0]}(${genInput(project, target, block.inputs.NUM)})`;
    },

    operator_random(project, target, block){
        return `rand(${genInput(project, target, block.inputs.FROM)}, ${genInput(project, target, block.inputs.TO)})`;
    },

    operator_round(project, target, block){
        return `round(${genInput(project, target, block.inputs.NUM)})`;
    },

    operator_length(project, target, block){
        return `len([]rune(${genInput(project, target, block.inputs.STRING)}))`;
    },

    operator_join(project, target, block){
        return `(${genInput(project, target, block.inputs.STRING1)}) + (${genInput(project, target, block.inputs.STRING2)})`;
    },

    operator_letter_of(project, target, block){
        return `string([]rune(${genInput(project, target, block.inputs.STRING)})[${genInput(project, target, block.inputs.LETTER)}])`;
    },

    procedures_definition(project, target, block){
        return {
            [`func ${genInput(project, target, block.inputs.custom_block)}`]: genFuncOrEvent(project, target, target.blocks[block.next]),
        };
    },

    procedures_prototype(project, target, block){
        const argNames = JSON.parse(block.mutation.argumentnames);
        return genFuncProto(block.mutation.proccode, argNames);
    },

    procedures_call(project, target, block){
        const argIds = JSON.parse(block.mutation.argumentids);

        const args = argIds.map(argId => genInput(project, target, block.inputs[argId])).join(', ');
        return `${genFuncName(block.mutation.proccode)}(${args})`;
    },

    sensing_touchingobject(project, target, block){
        return `touching(${genInput(project, target, block.inputs.TOUCHINGOBJECTMENU)})`;
    },

    sensing_touchingobjectmenu(project, target, block){
        const touchingObject = block.fields.TOUCHINGOBJECTMENU[0];
        return genTouchingObject(project, target, touchingObject);
    },

    sensing_mousedown(project, target, block){
        return `mousePressed`;
    },

    sensing_mousex(project, target, block) {
        return 'mouseX';
    },

    sensing_mousey(project, target, block) {
        return 'mouseY';
    },
};

function toListIndex(input){
    if (input === 'all') {
        return 'All';
    }
    return parseInt(input);
}

function genTouchingObject(project, target, touchingObject) {
    if (touchingObject == '_mouse_') {
        return 'Mouse';
    } else if (touchingObject == '_edge_') {
        return 'Edge';
    } else {
        return JSON.stringify(touchingObject);
    }
}

function genEffect(effectName) {
    return `${genClassName(effectName)}Effect`;
}

function genFuncArgType(argType) {
    switch (argType) {
        case 's': return 'string';
        case 'n': return 'int';
        default: return 'Unknown';
    }
}

function genFuncName(procName) {
    const [funcName, ..._] = procName.split(/ %/g);
    return `${genIdentifier(funcName)}`;
}

function genFuncProto(procName, argNames){
    const [funcName, ...argTypes] = procName.split(/ %/g);
    const args = argNames.map((argName, i) => `${genIdentifier(argName)} ${genFuncArgType(argTypes[i])}`).join(', ');
    return `${genIdentifier(funcName)}(${args})`;
}

function genInput(project, target, input) {
    if (typeof(input) === 'string') {
        return genFuncOrEvent(project, target, target.blocks[input]);
    }

    const [type, value, _] = input;

    switch (type) {
        case 1: // INPUT_SAME_BLOCK_SHADOW
            if (typeof(value) === 'string') {
                return genFuncOrEvent(project, target, target.blocks[value]);
            }
            return genInput(project, target, value);
        case 2: // INPUT_BLOCK_NO_SHADOW
            return genFuncOrEvent(project, target, target.blocks[value]);
        case 3: // INPUT_DIFF_BLOCK_SHADOW
            return genInput(project, target, value);
        case 4: // number
        case 5: // Positive number
        case 6: // Positive integer
        case 7: // Integer
            return value;
        case 8: // Angle
            return value;
        case 9: // Color
            return value;
        case 10: return JSON.stringify(value);
        case 11: return JSON.stringify(value); // broadcast
        case 12: return value; // variable
        default:
            console.log("genInput unknown:", input);
            return "Unknown"; // unknown
    }
}

function genFuncOrEvent(project, target, block) {
    if (!block) {
        return [];
    }

    // console.log("genFuncOrEvent:", block);

    const proc = blocks[block.opcode];
    if (proc) {
        let result = [proc(project, target, block)];
        if (block.next && !block.topLevel) {
            result = [...result, ...genFuncOrEvent(project, target, target.blocks[block.next])];
        }
        return result;
    } else {
        console.log("============ Unknown block", JSON.stringify(block, null, 4), "===========");
    }
}

function genCodeIndent(code, indent=0) {
    const indentStr = '\t'.repeat(indent);

    if (typeof(code) == 'object' && Array.isArray(code)) {
        return code.map(c => genCodeIndent(c, indent)).flat();
    } else if (typeof(code) == 'object') {
        const els = code["else"];
        if (els) {
            delete code["else"];
        }

        const [key, body] = Object.entries(code)[0];

        return [
            `${indentStr}${key} {`,
            ...genCodeIndent(body, indent + 1),
            ...(els ? [`${indentStr}} else {`] : []),
            ...(els ? genCodeIndent(els, indent + 1) : []),
            `${indentStr}}`,
        ];
    } else {
        return [`${indentStr}${code}`];
    }
}

function getBlockSortKey(block) {
    switch(block.opcode) {
        case 'procedures_definition':
            return 0;
        case 'event_whenflagclicked':
            return 1;
        case 'controls_start_as_clone':
            return 2;
        case 'event_whenthisspriteclicked':
            return 3;
        default:
            return 4;
    }
}

function cmpBlock(a, b) {
    const aKey = getBlockSortKey(a);
    const bKey = getBlockSortKey(b);
    return aKey - bKey || a.opcode.localeCompare(b.opcode);
}

export function genCode(project, target) {
    const topLevelBlocks = Object.entries(target.blocks).filter(([id, def]) => def.topLevel);
    const sortedBlocks = topLevelBlocks.sort(([id1, blk1], [id2, blk2]) => cmpBlock(blk1, blk2));
    const topLevels = sortedBlocks.map(block => genFuncOrEvent(project, target, block[1])[0]);
    const codeBlocks = topLevels.map(topLevel => genCodeIndent(topLevel).join("\n"));
    console.log("codeBlocks:", JSON.stringify(codeBlocks, null, 4));
    return codeBlocks.join("\n\n");
}

export function genTargetsCode(vm) {
    const project = sb3.serialize(vm.runtime);
    project.targets.forEach((target, i) => {
        const code = genCode(project, target);
        console.log("genCode:", target, "->", JSON.stringify(code, null, 4));
        const vmTarget = vm.runtime.targets[i];
        vmTarget.setCode(code);
    });
}
