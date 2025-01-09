let activeTool = 'move-resize'; // Default active tool
const canvas = document.getElementById('canvas');

function activateTool(tool) {
    activeTool = tool;
    document.querySelectorAll('.tool-button').forEach((btn) => btn.classList.remove('active'));
    document.getElementById(`${tool}-tool`).classList.add('active');

    // Show/hide tool-specific controls
    document.getElementById('eraser-controls').style.display = tool === 'erase' ? 'block' : 'none';
    document.getElementById('text-controls').style.display = tool === 'text' ? 'block' : 'none';
    document.getElementById('square-controls').style.display = tool === 'square' ? 'block' : 'none';
    document.getElementById('pencil-controls').style.display = tool === 'pencil' ? 'block' : 'none';

    // Set cursor for tools
    const toolCursorMap = {
        'cut': 'url("cut.png"), auto',
        'pencil': 'url("pencil.png"), auto',
        'erase': 'url("eraser.png"), auto',
        'text': 'url("text.png"), auto',
        'square': 'crosshair',
        'move-resize': 'crosshair',
    };
    canvas.style.cursor = toolCursorMap[tool] || 'crosshair';
}

// Event Listeners for tool buttons
const cutTool = document.getElementById('cut-tool');
const moveResizeTool = document.getElementById('move-resize-tool');
const textTool = document.getElementById('text-tool');
const pencilTool = document.getElementById('pencil-tool');
const eraseTool = document.getElementById('erase-tool');
const squareTool = document.getElementById('square-tool');

cutTool.addEventListener('click', () => activateTool('cut'));
moveResizeTool.addEventListener('click', () => activateTool('move-resize'));
textTool.addEventListener('click', () => activateTool('text'));
pencilTool.addEventListener('click', () => activateTool('pencil'));
eraseTool.addEventListener('click', () => activateTool('erase'));
squareTool.addEventListener('click', () => activateTool('square'));
