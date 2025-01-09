let isDrawing = false;
let previousMouseX = null;
let previousMouseY = null;

// Pencil Tool
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const activeLayer = layers[activeLayerIndex];
    if (!activeLayer) return;

    if (activeTool === 'cut') {
        path = [{ x: mouseX, y: mouseY }];
        return;
    }

    if (activeTool === 'move-resize') {
        resizingCorner = getResizingCorner(activeLayer, mouseX, mouseY);
        if (resizingCorner) {
            isResizing = true;
        } else {
            isDragging = true;
            dragOffsetX = mouseX - activeLayer.x;
            dragOffsetY = mouseY - activeLayer.y;
        }
    }
    
   
    if (activeTool === "square") {
        isDrawingSquare = true;

        const rect = canvas.getBoundingClientRect();
        squareStartX = event.clientX - rect.left;
        squareStartY = event.clientY - rect.top;

        // Create a new square layer
        const squareLayerCanvas = document.createElement("canvas");
        squareLayerCanvas.width = canvas.width;
        squareLayerCanvas.height = canvas.height;

        const squareLayer = {
            canvas: squareLayerCanvas,
            x: squareStartX,
            y: squareStartY,
            width: 0, // Start with no size
            height: 0, // Start with no size
            fillColor: squareFillColorPicker.value, // Use selected fill color
            strokeColor: squareStrokeColorPicker.value, // Use selected stroke color
            strokeWidth: parseInt(squareStrokeWidthSlider.value, 10), 
            isSquareLayer: true,
            opacity: 1.0,
            name: `Square Layer ${layers.length + 1}`,
        };

        layers.push(squareLayer);
        activeLayerIndex = layers.length - 1; // Set the new layer as active
    }
});

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const activeLayer = layers[activeLayerIndex];
    if (!activeLayer) return;

if (isResizing && activeLayerIndex !== null) {
const activeLayer = layers[activeLayerIndex];
resizeLayer(activeLayer, resizingCorner, mouseX, mouseY);
renderCanvas(); // Re-render after resizing
} else if (isDragging && activeLayerIndex !== null) {
const activeLayer = layers[activeLayerIndex];
activeLayer.x = mouseX - dragOffsetX;
activeLayer.y = mouseY - dragOffsetY;
renderCanvas();
}

    if (activeTool === 'cut' && path.length > 0) {
        path.push({ x: mouseX, y: mouseY });
        renderCanvas();
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    } 
    if (isDrawingSquare && activeTool === "square" && activeLayerIndex !== null) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const activeLayer = layers[activeLayerIndex];
        activeLayer.width = mouseX - squareStartX; // Update width
        activeLayer.height = mouseY - squareStartY; // Update height

        drawSquareOnLayer(activeLayer); // Update the square on its layer
        renderCanvas(); // Re-render the canvas
    }
    
});

canvas.addEventListener('mouseup', () => {
    const activeLayer = layers[activeLayerIndex];
    if (!activeLayer) return;

    if (activeTool === 'cut' && path.length > 2) {
        const layerCtx = activeLayer.canvas.getContext('2d');
        const scaleX = activeLayer.canvas.width / activeLayer.width;
        const scaleY = activeLayer.canvas.height / activeLayer.height;

        layerCtx.save();
        layerCtx.beginPath();
        layerCtx.moveTo(
            (path[0].x - activeLayer.x) * scaleX,
            (path[0].y - activeLayer.y) * scaleY
        );
        path.forEach((p) =>
            layerCtx.lineTo(
                (p.x - activeLayer.x) * scaleX,
                (p.y - activeLayer.y) * scaleY
            )
        );
        layerCtx.closePath();
        layerCtx.clip();
        layerCtx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
        layerCtx.restore();

        path = [];
        renderCanvas();
    }
    isDragging = false;
    isResizing = false;
    if (isDrawingSquare) {
        isDrawingSquare = false;
    }
});
canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (activeTool === "move-resize") {
        let selectedLayerIndex = null;

        // Iterate over layers in reverse order (topmost first)
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            if (layer.isSquareLayer) {
                // Check if the mouse is within the square layer
                const x = Math.min(layer.x, layer.x + layer.width);
                const y = Math.min(layer.y, layer.y + layer.height);
                const width = Math.abs(layer.width);
                const height = Math.abs(layer.height);

                if (
                    mouseX >= x &&
                    mouseX <= x + width &&
                    mouseY >= y &&
                    mouseY <= y + height
                ) {
                    selectedLayerIndex = i;
                    break;
                }
            } else if (
                mouseX >= layer.x &&
                mouseX <= layer.x + layer.width &&
                mouseY >= layer.y &&
                mouseY <= layer.y + layer.height
            ) {
                selectedLayerIndex = i;
                break;
            }
        }

        if (selectedLayerIndex !== null) {
            activeLayerIndex = selectedLayerIndex;
            const activeLayer = layers[activeLayerIndex];

            if (activeLayer.isSquareLayer || activeLayer.canvas) {
                isDragging = true;
                dragOffsetX = mouseX - activeLayer.x;
                dragOffsetY = mouseY - activeLayer.y;
            }
        } else {
            // Deselect all layers if clicking outside
            activeLayerIndex = null;
        }

        renderCanvas();
        updateLayersPanel();
        updateOpacitySlider();
    }

    if (activeTool === "square") {
        isDrawingSquare = true;
        squareStartX = mouseX;
        squareStartY = mouseY;

        const squareLayerCanvas = document.createElement("canvas");
        squareLayerCanvas.width = canvas.width;
        squareLayerCanvas.height = canvas.height;

        const squareLayer = {
            canvas: squareLayerCanvas,
            x: squareStartX,
            y: squareStartY,
            width: 0,
            height: 0,
            fillColor: squareFillColorPicker.value,
            strokeColor: squareStrokeColorPicker.value,
            strokeWidth: parseInt(squareStrokeWidthSlider.value, 10),
            isSquareLayer: true,
            opacity: 1.0,
            name: `Square Layer ${layers.length + 1}`,
        };

        layers.push(squareLayer);
        activeLayerIndex = layers.length - 1;
    }
});
canvas.addEventListener('mousedown', (event) => {
    if (activeTool === 'pencil') {
        if (!layers.some((layer) => layer.isDrawingLayer)) {
            addPencilLayer(); // Ensure there's a drawing layer
        }
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        previousMouseX = event.clientX - rect.left;
        previousMouseY = event.clientY - rect.top;
    }
    if (activeTool === 'erase' && activeLayerIndex !== null) {
        isErasing = true;
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDrawing && activeTool === 'pencil') {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const pencilLayer = layers[activeLayerIndex];
        const pencilCtx = pencilLayer.canvas.getContext('2d');

        pencilCtx.strokeStyle = pencilColorPicker.value;
        pencilCtx.lineWidth = pencilSizeSlider.value;
        pencilCtx.lineCap = 'round';
        pencilCtx.lineJoin = 'round';

        pencilCtx.beginPath();
        pencilCtx.moveTo(previousMouseX, previousMouseY);
        pencilCtx.lineTo(mouseX, mouseY);
        pencilCtx.stroke();

        previousMouseX = mouseX;
        previousMouseY = mouseY;

        renderCanvas();
    }

    if (isErasing && activeTool === 'erase' && activeLayerIndex !== null) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const activeLayer = layers[activeLayerIndex];
        const layerCtx = activeLayer.canvas.getContext('2d');

        const layerMouseX = mouseX - activeLayer.x;
        const layerMouseY = mouseY - activeLayer.y;

        layerCtx.clearRect(
            layerMouseX - eraseSizeSlider.value / 2,
            layerMouseY - eraseSizeSlider.value / 2,
            eraseSizeSlider.value,
            eraseSizeSlider.value
        );

        renderCanvas();
    }
});
function updateSquareControls(layer) {
    if (layer.isSquareLayer) {
        squareFillColorPicker.value = layer.fillColor || "#D3D3D3";
        squareStrokeColorPicker.value = layer.strokeColor || "#000000";
        squareStrokeWidthSlider.value = layer.strokeWidth || 2;
    }
}
function drawSquareOnLayer(layer) {
    const ctx = layer.canvas.getContext("2d");
    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height); // Clear the canvas

    // Adjust coordinates for negative dragging
    const x = Math.min(layer.x, layer.x + layer.width);
    const y = Math.min(layer.y, layer.y + layer.height);
    const width = Math.abs(layer.width);
    const height = Math.abs(layer.height);

    console.log("Square Layer Dimensions:", { x, y, width, height });

    // Fill the square
    if (layer.fillColor) {
        ctx.fillStyle = layer.fillColor;
        ctx.fillRect(0, 0, width, height);
    }

    // Stroke the square
    if (layer.strokeWidth > 0) {
        ctx.lineWidth = layer.strokeWidth;
        ctx.strokeStyle = layer.strokeColor;
        ctx.strokeRect(0, 0, width, height);
    }

    console.log("Square Rendered on Layer Canvas:", layer);
}
squareFillColorPicker.addEventListener("input", () => {
    if (activeLayerIndex !== null && layers[activeLayerIndex].isSquareLayer) {
        layers[activeLayerIndex].fillColor = squareFillColorPicker.value;
        renderCanvas(); // Re-render the canvas
    }
});

squareStrokeColorPicker.addEventListener("input", () => {
    if (activeLayerIndex !== null && layers[activeLayerIndex].isSquareLayer) {
        layers[activeLayerIndex].strokeColor = squareStrokeColorPicker.value;
        renderCanvas(); // Re-render the canvas
    }
});

squareStrokeWidthSlider.addEventListener("input", () => {
    if (activeLayerIndex !== null && layers[activeLayerIndex].isSquareLayer) {
        layers[activeLayerIndex].strokeWidth = parseInt(squareStrokeWidthSlider.value, 10);
        renderCanvas(); // Re-render the canvas
    }
});
function addPencilLayer() {
    const pencilLayerCanvas = document.createElement('canvas');
    pencilLayerCanvas.width = canvas.width;
    pencilLayerCanvas.height = canvas.height;

    const pencilLayer = {
        canvas: pencilLayerCanvas,
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        opacity: 1.0,
        isDrawingLayer: true,
        name: `Pencil Layer ${layers.length + 1}`,
    };

    layers.push(pencilLayer); // Add pencil layer
    activeLayerIndex = layers.length - 1; // Set the new layer as active
    renderCanvas();
    updateLayersPanel();
}
function drawSquareOnLayer(layer) {
    const ctx = layer.canvas.getContext("2d");
    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height); // Clear the canvas

    // Adjust coordinates for negative dragging
    const x = Math.min(layer.x, layer.x + layer.width);
    const y = Math.min(layer.y, layer.y + layer.height);
    const width = Math.abs(layer.width);
    const height = Math.abs(layer.height);

    console.log("Square Layer Dimensions:", { x, y, width, height });

    // Fill the square
    if (layer.fillColor) {
        ctx.fillStyle = layer.fillColor;
        ctx.fillRect(0, 0, width, height);
    }

    // Stroke the square
    if (layer.strokeWidth > 0) {
        ctx.lineWidth = layer.strokeWidth;
        ctx.strokeStyle = layer.strokeColor;
        ctx.strokeRect(0, 0, width, height);
    }

    console.log("Square Rendered on Layer Canvas:", layer);
}
squareFillColorPicker.addEventListener("input", () => {
    if (activeLayerIndex !== null && layers[activeLayerIndex].isSquareLayer) {
        layers[activeLayerIndex].fillColor = squareFillColorPicker.value;
        renderCanvas(); // Re-render the canvas
    }
});
