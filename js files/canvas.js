const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Render all layers on the canvas
function renderCanvas() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Iterate through all layers and draw them
    layers.forEach((layer, index) => {
        ctx.globalAlpha = layer.opacity; // Apply the layer's opacity
        if (layer.isSquareLayer) {
            // Square layer: draw directly on the main canvas
            const x = Math.min(layer.x, layer.x + layer.width);
            const y = Math.min(layer.y, layer.y + layer.height);
            const width = Math.abs(layer.width);
            const height = Math.abs(layer.height);

            if (layer.fillColor) {
                ctx.fillStyle = layer.fillColor;
                ctx.fillRect(x, y, width, height);
            }

            if (layer.strokeWidth > 0) {
                ctx.lineWidth = layer.strokeWidth;
                ctx.strokeStyle = layer.strokeColor;
                ctx.strokeRect(x, y, width, height);
            }
        } else {
            // Other layers (e.g., images, text)
            ctx.drawImage(layer.canvas, layer.x, layer.y, layer.width, layer.height);
        }
        ctx.globalAlpha = 1; // Reset opacity after drawing

        // Highlight the active layer with a stroke and optionally show resize handles
        if (index === activeLayerIndex) {
            ctx.strokeStyle = '#007BFF'; // Blue highlight for active layer
            ctx.lineWidth = 2;
            ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);

            // Draw resize handles if the move-resize tool is active
            if (activeTool === 'move-resize') {
                drawResizeHandles(layer);
            }
        }
         updateLayerDimensions();
    });

    // If the cut tool is active and a path is drawn, render the cut path
    if (activeTool === 'cut' && path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.strokeStyle = 'red'; // Red outline for the cut path
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function resizeLayer(layer, corner, mouseX, mouseY) {
    if (corner === 'bottom-right') {
        layer.width = mouseX - layer.x;
        layer.height = mouseY - layer.y;
    } else if (corner === 'bottom-left') {
        layer.width += layer.x - mouseX;
        layer.x = mouseX;
        layer.height = mouseY - layer.y;
    } else if (corner === 'top-right') {
        layer.height += layer.y - mouseY;
        layer.y = mouseY;
        layer.width = mouseX - layer.x;
    } else if (corner === 'top-left') {
        layer.width += layer.x - mouseX;
        layer.x = mouseX;
        layer.height += layer.y - mouseY;
        layer.y = mouseY;
    }
}

// Add resize/move listeners
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (activeTool === 'move-resize') {
        const activeLayer = layers[activeLayerIndex];
        if (!activeLayer) return;

        isDragging = true;
        dragOffsetX = mouseX - activeLayer.x;
        dragOffsetY = mouseY - activeLayer.y;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});
