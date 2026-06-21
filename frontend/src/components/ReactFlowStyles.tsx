'use client';

/**
 * ReactFlow styles as inline component — avoids Turbopack PostCSS issues.
 * Import this component wherever you use ReactFlow.
 */
export function ReactFlowStyles() {
  return (
    <style jsx global>{`
      .react-flow__container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
      .react-flow__pane { z-index: 1; cursor: grab; }
      .react-flow__pane.dragging { cursor: grabbing; }
      .react-flow__viewport { transform-origin: 0 0; z-index: 2; pointer-events: none; }
      .react-flow__renderer { z-index: 4; }
      .react-flow__zoompane { z-index: 1; }
      .react-flow__selectionpane { z-index: 5; }
      .react-flow__selection { z-index: 6; }
      .react-flow__edges { pointer-events: none; overflow: visible; position: absolute; z-index: 2; }
      .react-flow__edge { pointer-events: visibleStroke; cursor: pointer; }
      .react-flow__edge.animated path { stroke-dasharray: 5; animation: dashdraw .5s linear infinite; }
      .react-flow__edge.selected, .react-flow__edge:focus, .react-flow__edge:focus-visible { outline: none; }
      .react-flow__edge.selected .react-flow__edge-path { stroke: #555; }
      .react-flow__edge-textwrapper { pointer-events: all; }
      .react-flow__edge-textbg { fill: white; }
      .react-flow__connection { pointer-events: none; }
      .react-flow__connection .animated { stroke-dasharray: 5; animation: dashdraw .5s linear infinite; }
      .react-flow__connectionline { z-index: 1001; }
      .react-flow__nodes { pointer-events: none; transform-origin: 0 0; }
      .react-flow__node { position: absolute; user-select: none; pointer-events: all; transform-origin: 0 0; box-sizing: border-box; cursor: grab; }
      .react-flow__node.dragging { cursor: grabbing; }
      .react-flow__nodesselection { z-index: 3; transform-origin: left top; pointer-events: none; }
      .react-flow__nodesselection-rect { position: absolute; pointer-events: all; cursor: grab; }
      .react-flow__handle { position: absolute; pointer-events: none; min-width: 5px; min-height: 5px; width: 6px; height: 6px; background: #1a192b; border: 1px solid white; border-radius: 100%; }
      .react-flow__handle.connectable { pointer-events: all; cursor: crosshair; }
      .react-flow__handle-bottom { top: auto; left: 50%; bottom: -4px; transform: translate(-50%, 0); }
      .react-flow__handle-top { left: 50%; top: -4px; transform: translate(-50%, 0); }
      .react-flow__handle-left { top: 50%; left: -4px; transform: translate(0, -50%); }
      .react-flow__handle-right { right: -4px; top: 50%; transform: translate(0, -50%); }
      .react-flow__edgeupdater { cursor: move; pointer-events: all; }
      .react-flow__panel { position: absolute; z-index: 5; margin: 15px; }
      .react-flow__panel.top { top: 0; }
      .react-flow__panel.bottom { bottom: 0; }
      .react-flow__panel.left { left: 0; }
      .react-flow__panel.right { right: 0; }
      .react-flow__panel.center { left: 50%; transform: translateX(-50%); }
      .react-flow__controls { box-shadow: 0 0 2px 1px rgba(0,0,0,.08); }
      .react-flow__controls-button { border: none; background: white; border-bottom: 1px solid #eee; box-sizing: content-box; display: flex; justify-content: center; align-items: center; width: 16px; height: 16px; cursor: pointer; user-select: none; padding: 5px; }
      .react-flow__controls-button:hover { background: #f4f4f4; }
      .react-flow__controls-button svg { width: 100%; max-width: 12px; max-height: 12px; }
      .react-flow__minimap { box-shadow: 0 0 2px 1px rgba(0,0,0,.08); }
      .react-flow__background { pointer-events: none; }
      @keyframes dashdraw { from { stroke-dashoffset: 10; } }
    `}</style>
  );
}
