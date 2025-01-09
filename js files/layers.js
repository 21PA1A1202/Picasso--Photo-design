const layers = [];
let activeLayerIndex = null;
const layersPanel = document.getElementById('layers');

// Update Layers Panel
function updateLayersPanel() {
    layersPanel.innerHTML = '';

    // Display layers from top to bottom
    layers
        .slice()
        .reverse()
        .forEach((layer, reverseIndex) => {
            const actualIndex = layers.length - 1 - reverseIndex; // Get original index
            const layerDiv = document.createElement('div');
            layerDiv.classList.add('layer');
            layerDiv.setAttribute('draggable', true);
             // Enable dragging

            // Layer name display
            const layerName = document.createElement('span');
            layerName.textContent = layer.name || `Layer ${actualIndex + 1}`;
            layerDiv.appendChild(layerName);

            if (actualIndex === activeLayerIndex) {
                layerDiv.classList.add('active');
            }

            // Highlight layer on click
            layerDiv.addEventListener('click', () => {
                activeLayerIndex = actualIndex;
                renderCanvas();
                updateLayersPanel();
                updateOpacitySlider();
                if (layer.isTextLayer) {
                    enableTextEditingControls(layer); // Enable editing for the selected text layer
                }
            });

            // Enable renaming on double-click
            layerDiv.addEventListener('dblclick', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = layer.name || `Layer ${actualIndex + 1}`;
                input.classList.add('layer-input');
                layerDiv.innerHTML = ''; // Clear the layerDiv
                layerDiv.appendChild(input);

                // Focus the input and select the text
                input.focus();
                input.select();

                // Save the new name on blur or Enter key
                const saveName = () => {
                    layer.name = input.value.trim() || `Layer ${actualIndex + 1}`;
                    updateLayersPanel(); // Refresh the layers panel
                };

                input.addEventListener('blur', saveName);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') saveName();
                });
            });

            // Drag start event
            layerDiv.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('layer-index', actualIndex);
            });

            // Drag over event (allow drop)
            layerDiv.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            // Drop event (reorder layers)
            layerDiv.addEventListener('drop', (event) => {
                const draggedLayerIndex = event.dataTransfer.getData('layer-index');
                const targetLayerIndex = actualIndex;

                if (draggedLayerIndex !== null) {
                    const draggedLayer = layers.splice(draggedLayerIndex, 1)[0];
                    layers.splice(targetLayerIndex, 0, draggedLayer);
                    activeLayerIndex = layers.indexOf(draggedLayer);
                    renderCanvas();
                    updateLayersPanel();
                }
            });

            layersPanel.appendChild(layerDiv);
        });
}

// Add a new layer
function addLayer(name) {
    const layer = {
        canvas: document.createElement('canvas'),
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        opacity: 1.0,
        name,
    };
    layers.push(layer);
    activeLayerIndex = layers.length - 1;
    renderCanvas();
    updateLayersPanel();
}

// Delete a layer
const deleteTool = document.getElementById('delete-tool');
deleteTool.addEventListener('click', () => {
    if (activeLayerIndex !== null) {
        layers.splice(activeLayerIndex, 1);
        activeLayerIndex = layers.length > 0 ? layers.length - 1 : null;
        renderCanvas();
        updateLayersPanel();
    }
});
layersPanel.addEventListener("click", () => {
    if (activeLayerIndex !== null) {
        const activeLayer = layers[activeLayerIndex];
        updateSquareControls(activeLayer);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const moveResizeTool = document.getElementById('move-resize-tool');
    if (moveResizeTool) {
        moveResizeTool.click(); // Simulate a click on the Move/Resize button
    }
});

