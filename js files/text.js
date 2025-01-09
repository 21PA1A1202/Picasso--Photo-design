let isCreatingText = false;

textTool.addEventListener('click', () => {
    activateTool('text');
    isCreatingText = true;
});

canvas.addEventListener('mousedown', (event) => {
    if (isCreatingText && activeTool === 'text') {
        const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
        
                // Create a new text layer
                const textLayerCanvas = document.createElement('canvas');
                textLayerCanvas.width = canvas.width;
                textLayerCanvas.height = canvas.height;
        
                const textLayer = {
                    canvas: textLayerCanvas,
                    x: mouseX,
                    y: mouseY,
                    width: canvas.width,
                    height: canvas.height,
                    opacity: 1.0,
                    name: `Text Layer ${layers.length + 1}`, // Unique name for each layer
                    isTextLayer: true,
                    text: '', // Initial empty text
                    fontSize: textFontSizeSlider.value,
                    color: textColorPicker.value,
                    fontFamily: fontFamilyDropdown.value || 'Arial',
                };
        
                layers.push(textLayer); // Add the new layer to the layers array
                activeLayerIndex = layers.length - 1; // Set the new layer as the active layer
        
                renderCanvas();
                updateLayersPanel();
        
                // Enable text editing for the new layer
                enableTextEditingControls(textLayer);
    }
});
function drawTextOnLayer(layer) {
    const ctx = layer.canvas.getContext('2d');
    

    // Update canvas size based on text content
    const textMetrics = ctx.measureText(layer.text);
    layer.width = Math.ceil(textMetrics.width);
    layer.height = Math.ceil(parseInt(layer.fontSize) * 1.5); // Height based on font size

    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height); // Clear previous content
    layer.canvas.width = layer.width;
    layer.canvas.height = layer.height;
    ctx.font = `${layer.fontSize}px ${layer.fontFamily || 'Arial'}`; 
    ctx.fillStyle = layer.color;
    ctx.textBaseline = 'top';
    ctx.fillText(layer.text, 0, 0);
}
fontFamilyDropdown.addEventListener('change', () => {
    if (activeLayerIndex !== null && layers[activeLayerIndex].isTextLayer) {
        const activeLayer = layers[activeLayerIndex];
        activeLayer.fontFamily = fontFamilyDropdown.value;
        drawTextOnLayer(activeLayer);
        renderCanvas();
    }
});
