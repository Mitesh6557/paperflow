import { selectTool } from './selectTool.js';
import { rectangleTool } from './rectangleTool.js';
import { circleTool } from './circleTool.js';
import { lineTool } from './lineTool.js';
import { arrowTool } from './arrowTool.js';
import { drawTool } from './drawTool.js';
import { textTool } from './textTool.js';
import { highlightTool } from './highlightTool.js';

export const TOOLS = {
  select:    { id: 'select', label: 'Select', cursor: 'default', shortcut: 'v', handler: selectTool },
  hand:      { id: 'hand', label: 'Hand', cursor: 'grab', shortcut: 'h', handler: null },
  text:      { id: 'text', label: 'Text', cursor: 'text', shortcut: 't', handler: textTool },
  highlight: { id: 'highlight', label: 'Highlight', cursor: 'text', shortcut: null, handler: highlightTool },
  rect:      { id: 'rect', label: 'Rectangle', cursor: 'crosshair', shortcut: 'r', handler: rectangleTool },
  circle:    { id: 'circle', label: 'Circle', cursor: 'crosshair', shortcut: 'o', handler: circleTool },
  line:      { id: 'line', label: 'Line', cursor: 'crosshair', shortcut: 'l', handler: lineTool },
  arrow:     { id: 'arrow', label: 'Arrow', cursor: 'crosshair', shortcut: 'a', handler: arrowTool },
  draw:      { id: 'draw', label: 'Draw', cursor: 'crosshair', shortcut: 'd', handler: drawTool },
};
