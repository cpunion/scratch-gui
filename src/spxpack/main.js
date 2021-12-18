import fs from 'fs';
import {genCode} from './code';

const project = JSON.parse(fs.readFileSync('./project.json', 'utf8'));
const target = project.targets[7];
console.log(target.name);
console.log(genCode(project, target));

