import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer,
  Minus,
  Square,
  Circle,
  Pencil,
  Type,
  Eraser,
  Ruler,
  Undo2,
  Redo2,
  Download,
  Save,
  FolderOpen,
  FilePlus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Grid3X3,
  Send,
  MessageCircle,
  CheckCircle,
  Trash2,
  ChevronDown,
  Share2,
  Copy,
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../utils/helpers';
import { getR2AssetUrl } from '../utils/r2';

// Types
type Tool = 'select' | 'line' | 'rectangle' | 'circle' | 'brush' | 'text' | 'eraser' | 'measure';

interface Shape {
  id: string;
  type: Tool;
  points: { x: number; y: number }[];
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
}


interface SavedDrawing {
  id: string;
  name: string;
  shapes: Shape[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

// Tool definitions
const tools: { id: Tool; icon: React.ElementType; label: string; shortcut: string; hint: string }[] = [
  { id: 'select', icon: MousePointer, label: 'Select / Move', shortcut: 'V', hint: 'Click to select shapes, drag to move them' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L', hint: 'Click and drag to draw a straight line' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R', hint: 'Click and drag to draw a rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C', hint: 'Click and drag to draw a circle or ellipse' },
  { id: 'brush', icon: Pencil, label: 'Freehand Brush', shortcut: 'B', hint: 'Click and drag to draw freely' },
  { id: 'text', icon: Type, label: 'Text Label', shortcut: 'T', hint: 'Click to add a text label (e.g., "Kitchen", "North")' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E', hint: 'Click on shapes to delete them' },
  { id: 'measure', icon: Ruler, label: 'Measure', shortcut: 'M', hint: 'Click and drag to measure distance' },
];

// Preset colors
const colorPresets = ['#1e3a5f', '#000000', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#06b6d4', '#f59e0b'];

const DrawingBoard: React.FC = () => {
  const { addNotification } = useNotification();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingStateRef = useRef({
    isDrawing: false,
    startPoint: null as { x: number; y: number } | null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    draggedShapeId: null as string | null,
    isResizing: false,
    resizeHandle: null as string | null,
    resizeStartPoint: null as { x: number; y: number } | null,
    resizeStartBounds: null as { x: number; y: number; width: number; height: number } | null,
    maintainAspectRatio: false,
  });

  // Tool & Drawing State
  const [selectedTool, setSelectedTool] = useState<Tool>('rectangle');
  const [strokeColor, setStrokeColor] = useState('#1e3a5f');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(3); // More visible default
  const [fontSize, setFontSize] = useState(18); // Larger default font

  // Canvas State
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  // Panning state (using refs for event handlers)
  const [isPanning] = useState(false);
  const [panStart] = useState({ x: 0, y: 0 });

  // Refs to access current state values in event handlers
  const selectedToolRef = useRef(selectedTool);
  const isDrawingRef = useRef(isDrawing);
  const isPanningRef = useRef(isPanning);
  const currentPointsRef = useRef(currentPoints);
  const panStartRef = useRef(panStart);
  const strokeColorRef = useRef(strokeColor);
  const fillColorRef = useRef(fillColor);
  const strokeWidthRef = useRef(strokeWidth);
  const fontSizeRef = useRef(fontSize);
  const shapesRef = useRef(shapes);

  // Update refs when state changes
  useEffect(() => {
    selectedToolRef.current = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);

  useEffect(() => {
    currentPointsRef.current = currentPoints;
  }, [currentPoints]);

  useEffect(() => {
    panStartRef.current = panStart;
  }, [panStart]);

  useEffect(() => {
    strokeColorRef.current = strokeColor;
  }, [strokeColor]);

  useEffect(() => {
    fillColorRef.current = fillColor;
  }, [fillColor]);

  useEffect(() => {
    strokeWidthRef.current = strokeWidth;
  }, [strokeWidth]);

  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  // History (storing shape arrays)
  const [undoStack, setUndoStack] = useState<Shape[][]>([]);
  const [redoStack, setRedoStack] = useState<Shape[][]>([]);

  // UI State
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);
  const [showConsultantModal, setShowConsultantModal] = useState(false);
  // Text input state
  const [textInput, setTextInput] = useState<{ visible: boolean; x: number; y: number; value: string }>({
    visible: false,
    x: 0,
    y: 0,
    value: '',
  });
  const textInputRef = useRef<HTMLInputElement>(null);
  const textInputStateRef = useRef(textInput);
  const isShowingTextInputRef = useRef(false);
  
  // Update text input ref when state changes
  useEffect(() => {
    textInputStateRef.current = textInput;
    // Reset the showing flag after a short delay
    if (textInput.visible) {
      isShowingTextInputRef.current = true;
      setTimeout(() => {
        isShowingTextInputRef.current = false;
      }, 200);
    }
  }, [textInput]);
  const [uploadingToConsultant, setUploadingToConsultant] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [drawingNote, setDrawingNote] = useState('');

  // Save/Open State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDrawingName, setNewDrawingName] = useState('');
  const [drawingName, setDrawingName] = useState('');
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const gridSize = 25;
  const STORAGE_KEY = 'keyvasthu_saved_drawings';
  const TOOLS_ORDER_KEY = 'keyvasthu_tools_order';
  
  // Tool order state - allow reordering
  const [toolOrder] = useState<Tool[]>(() => {
    // Load saved order from localStorage
    const saved = localStorage.getItem(TOOLS_ORDER_KEY);
    if (saved) {
      try {
        const savedOrder = JSON.parse(saved) as Tool[];
        // Validate that all tools are present
        const allToolIds = tools.map(t => t.id);
        const validOrder = savedOrder.filter(id => allToolIds.includes(id));
        // Add any missing tools
        const missing = allToolIds.filter(id => !validOrder.includes(id));
        return [...validOrder, ...missing];
      } catch (e) {
        console.error('Failed to load tool order:', e);
      }
    }
    return tools.map(t => t.id);
  });
  
  // Get ordered tools
  const orderedTools = toolOrder.map(id => tools.find(t => t.id === id)!).filter(Boolean);
  

  // Consultants list (stub data)
  const consultants = [
    { id: '1', name: 'Dr. Sharma', specialty: 'Vasthu Expert', avatar: 'S' },
    { id: '2', name: 'Mr. Rajan', specialty: 'Astrology Consultant', avatar: 'R' },
    { id: '3', name: 'Support Team', specialty: 'General Queries', avatar: 'K' },
  ];

  // Add to activity log (no-op since activity log was removed)
  const logActivity = (_action: string) => {
    // Activity logging removed - function kept for compatibility
  };

  // Load saved drawings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedDrawings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load saved drawings:', e);
      }
    }
  }, []);

  // Save tool order to localStorage when it changes
  useEffect(() => {
    if (toolOrder.length > 0) {
      localStorage.setItem(TOOLS_ORDER_KEY, JSON.stringify(toolOrder));
    }
  }, [toolOrder]);

  // Generate thumbnail from canvas
  const generateThumbnail = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    // Create a smaller canvas for thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = canvas.width * 0.3;
    thumbCanvas.height = canvas.height * 0.3;
    const thumbCtx = thumbCanvas.getContext('2d');
    if (!thumbCtx) return '';
    
    thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    return thumbCanvas.toDataURL('image/png', 0.5);
  };

  // Calculate bounding box for a shape
  const getShapeBounds = (shape: Shape): { x: number; y: number; width: number; height: number } | null => {
    if (shape.points.length === 0) return null;

    if (shape.type === 'rectangle' && shape.points.length >= 2) {
      const [p1, p2] = [shape.points[0], shape.points[shape.points.length - 1]];
      const x = Math.min(p1.x, p2.x);
      const y = Math.min(p1.y, p2.y);
      const width = Math.abs(p2.x - p1.x);
      const height = Math.abs(p2.y - p1.y);
      return { x, y, width, height };
    } else if (shape.type === 'circle' && shape.points.length >= 2) {
      const [c, e] = [shape.points[0], shape.points[shape.points.length - 1]];
      const rx = Math.abs(e.x - c.x);
      const ry = Math.abs(e.y - c.y);
      return { x: c.x - rx, y: c.y - ry, width: rx * 2, height: ry * 2 };
    } else if (shape.type === 'line' && shape.points.length >= 2) {
      const [p1, p2] = [shape.points[0], shape.points[shape.points.length - 1]];
      const x = Math.min(p1.x, p2.x);
      const y = Math.min(p1.y, p2.y);
      const width = Math.abs(p2.x - p1.x);
      const height = Math.abs(p2.y - p1.y);
      // Add padding for line selection
      return { x: x - 5, y: y - 5, width: width + 10, height: height + 10 };
    } else if (shape.type === 'brush' && shape.points.length >= 2) {
      let minX = shape.points[0].x;
      let minY = shape.points[0].y;
      let maxX = shape.points[0].x;
      let maxY = shape.points[0].y;
      shape.points.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
      const padding = 5;
      return { x: minX - padding, y: minY - padding, width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 };
    } else if (shape.type === 'text' && shape.points.length > 0 && shape.text) {
      const p = shape.points[0];
      const fontSize = shape.fontSize || 16;
      const textWidth = shape.text.length * fontSize * 0.6;
      const textHeight = fontSize;
      const padding = 4;
      return { x: p.x - padding, y: p.y - textHeight - padding, width: textWidth + padding * 2, height: textHeight + padding * 2 };
    }
    return null;
  };

  // Get handle position from handle type
  const getHandlePosition = (bounds: { x: number; y: number; width: number; height: number }, handle: string): { x: number; y: number } => {
    const { x, y, width, height } = bounds;
    switch (handle) {
      case 'nw': return { x, y };
      case 'n': return { x: x + width / 2, y };
      case 'ne': return { x: x + width, y };
      case 'e': return { x: x + width, y: y + height / 2 };
      case 'se': return { x: x + width, y: y + height };
      case 's': return { x: x + width / 2, y: y + height };
      case 'sw': return { x, y: y + height };
      case 'w': return { x, y: y + height / 2 };
      default: return { x: 0, y: 0 };
    }
  };

  // Get cursor style for resize handle
  const getResizeCursor = (handle: string): string => {
    switch (handle) {
      case 'nw': case 'se': return 'nwse-resize';
      case 'ne': case 'sw': return 'nesw-resize';
      case 'n': case 's': return 'ns-resize';
      case 'e': case 'w': return 'ew-resize';
      default: return 'default';
    }
  };

  // Apply resize transformation to shape points
  const applyResize = (shape: Shape, _startBounds: { x: number; y: number; width: number; height: number }, newBounds: { x: number; y: number; width: number; height: number }, _handle: string): Shape => {
    if (shape.type === 'rectangle' && shape.points.length >= 2) {
      // For rectangles, just update the two corner points
      const newP1 = { x: newBounds.x, y: newBounds.y };
      const newP2 = { x: newBounds.x + newBounds.width, y: newBounds.y + newBounds.height };
      return { ...shape, points: [newP1, newP2] };
    } else if (shape.type === 'circle' && shape.points.length >= 2) {
      // For circles, calculate center from bounds and set radius
      const centerX = newBounds.x + newBounds.width / 2;
      const centerY = newBounds.y + newBounds.height / 2;
      const newRx = newBounds.width / 2;
      const newRy = newBounds.height / 2;
      const newC = { x: centerX, y: centerY };
      const newE = { x: centerX + newRx, y: centerY + newRy };
      return { ...shape, points: [newC, newE] };
    } else if (shape.type === 'line' && shape.points.length >= 2) {
      // For lines, update the two endpoints
      const newP1 = { x: newBounds.x, y: newBounds.y };
      const newP2 = { x: newBounds.x + newBounds.width, y: newBounds.y + newBounds.height };
      return { ...shape, points: [newP1, newP2] };
    } else if (shape.type === 'brush' && shape.points.length >= 2) {
      // For brush strokes, scale all points relative to the bounding box
      const oldMinX = Math.min(...shape.points.map(p => p.x));
      const oldMinY = Math.min(...shape.points.map(p => p.y));
      const oldMaxX = Math.max(...shape.points.map(p => p.x));
      const oldMaxY = Math.max(...shape.points.map(p => p.y));
      const oldWidth = oldMaxX - oldMinX;
      const oldHeight = oldMaxY - oldMinY;
      
      return {
        ...shape,
        points: shape.points.map(p => ({
          x: newBounds.x + ((p.x - oldMinX) / (oldWidth || 1)) * newBounds.width,
          y: newBounds.y + ((p.y - oldMinY) / (oldHeight || 1)) * newBounds.height,
        })),
      };
    } else if (shape.type === 'text' && shape.points.length > 0) {
      // For text, just move the position
      return { ...shape, points: [{ x: newBounds.x + 4, y: newBounds.y + newBounds.height - 4 }] };
    }
    return shape;
  };

  // Check if point is on a resize handle
  const getHandleAtPoint = (bounds: { x: number; y: number; width: number; height: number }, x: number, y: number): string | null => {
    const handleSize = 12; // Larger handles for better UX and easier clicking
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    for (const handle of handles) {
      const pos = getHandlePosition(bounds, handle);
      const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (dist <= handleSize) {
        return handle;
      }
    }
    return null;
  };

  // Helper function to find shape at point
  const findShapeAtPoint = (x: number, y: number): Shape | null => {
    // Use ref to get latest shapes (important for event handlers)
    const currentShapes = shapesRef.current || shapes;
    // Check shapes in reverse order (top to bottom)
    for (let i = currentShapes.length - 1; i >= 0; i--) {
      const shape = currentShapes[i];
      
      if (shape.type === 'rectangle' && shape.points.length >= 2) {
        const [p1, p2] = [shape.points[0], shape.points[shape.points.length - 1]];
        const left = Math.min(p1.x, p2.x);
        const top = Math.min(p1.y, p2.y);
        const right = Math.max(p1.x, p2.x);
        const bottom = Math.max(p1.y, p2.y);
        if (x >= left && x <= right && y >= top && y <= bottom) {
          return shape;
        }
      } else if (shape.type === 'circle' && shape.points.length >= 2) {
        const [c, e] = [shape.points[0], shape.points[shape.points.length - 1]];
        const rx = Math.abs(e.x - c.x);
        const ry = Math.abs(e.y - c.y);
        // Avoid division by zero
        if (rx === 0 && ry === 0) {
          // Point circle - check if click is very close to center
          const dist = Math.sqrt(Math.pow(x - c.x, 2) + Math.pow(y - c.y, 2));
          if (dist < 5) {
            return shape;
          }
        } else {
          const dx = rx > 0 ? (x - c.x) / rx : 0;
          const dy = ry > 0 ? (y - c.y) / ry : 0;
          if (dx * dx + dy * dy <= 1) {
            return shape;
          }
        }
      } else if (shape.type === 'line' && shape.points.length >= 2) {
        const [p1, p2] = [shape.points[0], shape.points[shape.points.length - 1]];
        const dist = Math.abs((p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x) / 
                     Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
        if (dist < 5) { // 5px tolerance
          return shape;
        }
      } else if (shape.type === 'brush' && shape.points.length >= 2) {
        // Check if point is near any segment of the path
        for (let j = 0; j < shape.points.length - 1; j++) {
          const p1 = shape.points[j];
          const p2 = shape.points[j + 1];
          const dist = Math.abs((p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x) / 
                       Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
          if (dist < 5) {
            return shape;
          }
        }
      } else if (shape.type === 'text' && shape.points.length > 0 && shape.text) {
        const p = shape.points[0];
        const fontSize = shape.fontSize || 16;
        // Better text bounds calculation
        const textWidth = shape.text.length * fontSize * 0.6;
        const textHeight = fontSize;
        // Text is drawn from baseline, so check if point is within bounds
        // Add some padding for easier selection
        const padding = 5;
        if (x >= p.x - padding && x <= p.x + textWidth + padding && 
            y >= p.y - textHeight - padding && y <= p.y + padding) {
          return shape;
        }
      }
    }
    return null;
  };

  // Save drawing
  const handleSaveDrawing = (name: string) => {
    if (!name.trim()) {
      addNotification('warning', 'Name Required', 'Please enter a name for your drawing.');
      return;
    }

    const now = new Date().toISOString();
    const thumbnail = generateThumbnail();
    
    let updatedDrawings: SavedDrawing[];
    
    if (currentDrawingId) {
      // Update existing drawing
      updatedDrawings = savedDrawings.map(d => 
        d.id === currentDrawingId 
          ? { ...d, name: name.trim(), shapes, updatedAt: now, thumbnail }
          : d
      );
      logActivity(`Updated "${name}"`);
      addNotification('success', 'Drawing Updated', `"${name}" has been saved.`);
    } else {
      // Create new drawing
      const newDrawing: SavedDrawing = {
        id: `drawing-${Date.now()}`,
        name: name.trim(),
        shapes,
        createdAt: now,
        updatedAt: now,
        thumbnail,
      };
      updatedDrawings = [newDrawing, ...savedDrawings];
      setCurrentDrawingId(newDrawing.id);
      logActivity(`Saved "${name}"`);
      addNotification('success', 'Drawing Saved', `"${name}" has been saved.`);
    }
    
    setSavedDrawings(updatedDrawings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrawings));
    setShowSaveModal(false);
    setDrawingName(name);
  };

  // Render canvas with all shapes (can accept optional shapes array to render)
  const renderCanvas = useCallback((shapesToRender?: Shape[]) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    // Use provided shapes, or ref (for event handlers), or state (for React renders)
    const shapesToDraw = shapesToRender || shapesRef.current || shapes;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw all shapes
    shapesToDraw.forEach(shape => {
      ctx.save();
      ctx.strokeStyle = shape.strokeColor;
      ctx.fillStyle = shape.fillColor === 'transparent' ? 'transparent' : shape.fillColor;
      ctx.lineWidth = shape.strokeWidth;
      
      // Don't highlight selected shape with thicker stroke - we'll use bounding box instead

      if (shape.type === 'rectangle' && shape.points.length >= 2) {
        const [p1, p2] = [shape.points[0], shape.points[shape.points.length - 1]];
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const width = Math.abs(p2.x - p1.x);
        const height = Math.abs(p2.y - p1.y);
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
      } else if (shape.type === 'circle' && shape.points.length >= 2) {
        const [c, e] = [shape.points[0], shape.points[shape.points.length - 1]];
        const rx = Math.abs(e.x - c.x);
        const ry = Math.abs(e.y - c.y);
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, rx, ry, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (shape.type === 'line' && shape.points.length >= 2) {
        const [p1, p2] = [shape.points[0], shape.points[shape.points.length - 1]];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else if (shape.type === 'brush' && shape.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
      } else if (shape.type === 'text' && shape.text && shape.points.length > 0) {
        const fontSize = shape.fontSize || 16;
        const p = shape.points[0];
        
        // Selection indicator removed - using bounding box instead
        
        ctx.fillStyle = shape.strokeColor;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(shape.text, p.x, p.y);
      }
      
      ctx.restore();
    });

    // Draw bounding box for hovered shape (preview, only when select tool is active)
    if (hoveredShapeId && hoveredShapeId !== selectedShapeId && selectedTool === 'select') {
      const hoveredShape = shapesToDraw.find(s => s.id === hoveredShapeId);
      if (hoveredShape) {
        const bounds = getShapeBounds(hoveredShape);
        if (bounds) {
          ctx.save();
          // Draw preview bounding box (lighter, no handles)
          ctx.strokeStyle = '#4285f4';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.globalAlpha = 0.6;
          ctx.strokeRect(bounds.x - 1, bounds.y - 1, bounds.width + 2, bounds.height + 2);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }
    }

    // Draw bounding box and handles for selected shape (only when select tool is active)
    if (selectedShapeId && selectedTool === 'select') {
      const selectedShape = shapesToDraw.find(s => s.id === selectedShapeId);
      if (selectedShape) {
        const bounds = getShapeBounds(selectedShape);
        if (bounds) {
          ctx.save();
          
          // Draw bounding box outline with better styling (Canva-like)
          ctx.strokeStyle = '#4285f4';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(bounds.x - 1, bounds.y - 1, bounds.width + 2, bounds.height + 2);
          
          // Draw inner border for better visibility
          ctx.strokeStyle = '#4285f4';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.globalAlpha = 0.3;
          ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
          ctx.globalAlpha = 1;
          
          // Draw handles (Canva-style: larger, more visible, with better styling)
          const handleSize = 12;
          const handleRadius = handleSize / 2;
          const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
          
          handles.forEach(handle => {
            const pos = getHandlePosition(bounds, handle);
            const isHovered = hoveredHandle === handle;
            const currentRadius = isHovered ? handleRadius + 1 : handleRadius;
            
            // Outer white ring for contrast (larger for better visibility)
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, currentRadius + 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = isHovered ? '#1a73e8' : '#4285f4';
            ctx.lineWidth = isHovered ? 2 : 1.5;
            ctx.stroke();
            
            // Inner blue circle (more prominent, larger when hovered)
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, currentRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isHovered ? '#1a73e8' : '#4285f4';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = isHovered ? 2.5 : 2;
            ctx.stroke();
            
            // Add a subtle shadow for depth
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, currentRadius + 1, 0, 2 * Math.PI);
            ctx.strokeStyle = isHovered ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
          
          ctx.restore();
        }
      }
    }
  }, [shapes, selectedShapeId, hoveredShapeId, hoveredHandle, selectedTool, showGrid, gridSize]);

  // Load shapes to canvas
  const loadShapesToCanvas = useCallback((shapesToLoad: Shape[]) => {
    setShapes(shapesToLoad);
    renderCanvas(shapesToLoad);
  }, [renderCanvas]);

  // Open drawing
  const handleOpenDrawing = (drawing: SavedDrawing) => {
    if (shapes.length > 0 && !window.confirm('Open a saved drawing? Current work will be lost.')) return;
    
    // Load from shapes
    loadShapesToCanvas(drawing.shapes);

    setCurrentDrawingId(drawing.id);
    setDrawingName(drawing.name);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedShapeId(null);
    setShowOpenModal(false);
    logActivity(`Opened "${drawing.name}"`);
    addNotification('info', 'Drawing Opened', `"${drawing.name}" is now open.`);
  };

  // Delete saved drawing
  const handleDeleteDrawing = (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    
    const updatedDrawings = savedDrawings.filter(d => d.id !== id);
    setSavedDrawings(updatedDrawings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrawings));
    
    if (currentDrawingId === id) {
      setCurrentDrawingId(null);
      setDrawingName('');
    }
    
    addNotification('info', 'Drawing Deleted', `"${name}" has been deleted.`);
  };

  // Quick save (saves to current drawing if exists, otherwise opens Save As)
  const handleQuickSave = () => {
    if (currentDrawingId && drawingName) {
      handleSaveDrawing(drawingName);
    } else {
      setShowSaveModal(true);
    }
  };

  // Save state for undo - saves current state BEFORE making changes
  const saveState = useCallback((shapesToSave?: Shape[]) => {
    // Use provided shapes, or ref, or state (in that order of preference)
    const currentShapes = shapesToSave || shapesRef.current || shapes;
    
    // Create a deep copy of shapes to avoid reference issues
    const shapesCopy = currentShapes.map(shape => ({
      ...shape,
      points: shape.points.map(p => ({ ...p })),
    }));
    
    // Prevent saving duplicate consecutive states
    setUndoStack(prev => {
      const lastState = prev.length > 0 ? prev[prev.length - 1] : null;
      // Check if this state is different from the last saved state
      if (lastState) {
        if (lastState.length === shapesCopy.length) {
          // Compare shapes by ID to avoid saving identical states
          const isSame = lastState.every((s, i) => 
            s.id === shapesCopy[i]?.id && 
            s.points.length === shapesCopy[i]?.points.length
          );
          if (isSame) {
            return prev; // Don't save duplicate state
          }
        }
      }
      // Always save the state
      return [...prev, shapesCopy];
    });
    setRedoStack([]);
  }, [shapes]);

  // Handle text input submission
  const handleTextSubmit = (text: string, screenX: number, screenY: number) => {
    if (!text.trim()) {
      setTextInput({ visible: false, x: 0, y: 0, value: '' });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert screen coordinates to canvas coordinates
    const rect = canvas.getBoundingClientRect();
    const canvasX = ((screenX - rect.left) / rect.width) * canvas.width;
    const canvasY = ((screenY - rect.top) / rect.height) * canvas.height;
    const snapped = snapToGrid({ x: canvasX, y: canvasY });

    // Save current state before adding text
    const currentShapes = shapesRef.current || shapes;
    saveState(currentShapes);
    
    const shapeId = `shape-${Date.now()}`;
    const newShape: Shape = {
      id: shapeId,
      type: 'text',
      points: [snapped],
      strokeColor: strokeColorRef.current,
      fillColor: 'transparent',
      strokeWidth: strokeWidthRef.current,
      text: text.trim(),
      fontSize: fontSizeRef.current,
    };
    setShapes(prev => {
      const updatedShapes = [...prev, newShape];
      renderCanvas(updatedShapes);
      return updatedShapes;
    });
    setTextInput({ visible: false, x: 0, y: 0, value: '' });
  };

  // Handle text input cancel
  const handleTextCancel = () => {
    setTextInput({ visible: false, x: 0, y: 0, value: '' });
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    // Get current shapes from ref to ensure we have the latest
    const currentShapes = shapesRef.current || shapes;
    // Save current state to redo stack
    const currentShapesCopy = currentShapes.map(shape => ({
      ...shape,
      points: shape.points.map(p => ({ ...p })),
    }));
    setRedoStack(prev => [...prev, currentShapesCopy]);
    
    // Get previous state from undo stack
    const prevShapes = undoStack[undoStack.length - 1];
    // Create a deep copy to avoid reference issues
    const prevShapesCopy = prevShapes.map(shape => ({
      ...shape,
      points: shape.points.map(p => ({ ...p })),
    }));
    
    setShapes(prevShapesCopy);
    setUndoStack(prev => prev.slice(0, -1));
    setSelectedShapeId(null);
    logActivity('Undo');
    renderCanvas(prevShapesCopy);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    // Get current shapes from ref to ensure we have the latest
    const currentShapes = shapesRef.current || shapes;
    // Save current state to undo stack
    const currentShapesCopy = currentShapes.map(shape => ({
      ...shape,
      points: shape.points.map(p => ({ ...p })),
    }));
    setUndoStack(prev => [...prev, currentShapesCopy]);
    
    // Get next state from redo stack
    const nextShapes = redoStack[redoStack.length - 1];
    // Create a deep copy to avoid reference issues
    const nextShapesCopy = nextShapes.map(shape => ({
      ...shape,
      points: shape.points.map(p => ({ ...p })),
    }));
    
    setShapes(nextShapesCopy);
    setRedoStack(prev => prev.slice(0, -1));
    setSelectedShapeId(null);
    logActivity('Redo');
    renderCanvas(nextShapesCopy);
  };

  // New canvas - show modal to name the new drawing
  const handleNew = () => {
    if (shapes.length > 0 && !window.confirm('Start a new drawing? Current work will be lost.')) return;
    setNewDrawingName('');
    setShowNewModal(true);
  };

  // Create new named drawing
  const handleCreateNewDrawing = (name: string) => {
    if (!name.trim()) {
      addNotification('warning', 'Name Required', 'Please enter a name for your drawing.');
      return;
    }

    // Clear canvas and set new drawing info
    setShapes([]);
    renderCanvas([]);
    setSelectedShapeId(null);
    setUndoStack([]);
    setRedoStack([]);
    setDrawingName(name.trim());
    setCurrentDrawingId(null); // Will be assigned when saved
    setShowNewModal(false);
    logActivity(`New drawing: "${name}"`);
    addNotification('success', 'New Drawing', `"${name}" is ready to use!`);
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (shapes.length === 0) {
      addNotification('info', 'Canvas Already Empty', 'There is nothing to clear.');
      return;
    }

    if (!window.confirm('Clear the entire canvas? This cannot be undone.')) return;

    // Save current state before clearing
    const currentShapes = shapesRef.current || shapes;
    saveState(currentShapes);

    setShapes([]);
    renderCanvas([]);
    setSelectedShapeId(null);
    setCurrentPoints([]);
    currentPointsRef.current = [];
    logActivity('Canvas cleared');
    addNotification('success', 'Canvas Cleared', 'All shapes have been removed.');
  };

  // Duplicate selected shape
  const handleDuplicateShape = () => {
    if (!selectedShapeId) return;
    
    const currentShapes = shapesRef.current || shapes;
    const shapeToDuplicate = currentShapes.find(s => s.id === selectedShapeId);
    if (!shapeToDuplicate) return;
    
    // Save current state before duplicating
    saveState(currentShapes);
    
    // Create a deep copy of the shape with a new ID and offset position
    const offset = 20; // Offset the duplicate by 20px
    const duplicatedShape: Shape = {
      ...shapeToDuplicate,
      id: `shape-${Date.now()}`,
      points: shapeToDuplicate.points.map(p => ({ x: p.x + offset, y: p.y + offset })),
    };
    
    const updatedShapes = [...currentShapes, duplicatedShape];
    setShapes(updatedShapes);
    setSelectedShapeId(duplicatedShape.id); // Select the new duplicate
    renderCanvas(updatedShapes);
    logActivity('Shape duplicated');
    addNotification('success', 'Duplicated', 'Shape has been duplicated.');
  };

  // Delete selected shape (for toolbar)
  const handleDeleteSelectedShape = () => {
    if (!selectedShapeId) return;
    
    // Save current state before deleting
    const currentShapes = shapesRef.current || shapes;
    saveState(currentShapes);
    
    setShapes(prev => {
      const updatedShapes = prev.filter(s => s.id !== selectedShapeId);
      renderCanvas(updatedShapes);
      return updatedShapes;
    });
    setSelectedShapeId(null);
    logActivity('Shape deleted');
    addNotification('info', 'Deleted', 'Shape has been removed.');
  };

  // Export
  const handleExport = (format: 'png' | 'jpg' | 'svg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `drawing.${format}`;
    
    if (format === 'svg') {
      // Generate SVG from shapes
      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">`;
      svgContent += `<rect width="100%" height="100%" fill="white"/>`;
      
      shapes.forEach(shape => {
        if (shape.type === 'rectangle' && shape.points.length >= 2) {
          const [p1, p2] = [shape.points[0], shape.points[shape.points.length - 1]];
          const x = Math.min(p1.x, p2.x);
          const y = Math.min(p1.y, p2.y);
          const width = Math.abs(p2.x - p1.x);
          const height = Math.abs(p2.y - p1.y);
          svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${shape.strokeColor}" fill="${shape.fillColor === 'transparent' ? 'none' : shape.fillColor}" stroke-width="${shape.strokeWidth}"/>`;
        } else if (shape.type === 'circle' && shape.points.length >= 2) {
          const [c, e] = [shape.points[0], shape.points[shape.points.length - 1]];
          const rx = Math.abs(e.x - c.x);
          const ry = Math.abs(e.y - c.y);
          svgContent += `<ellipse cx="${c.x}" cy="${c.y}" rx="${rx}" ry="${ry}" stroke="${shape.strokeColor}" fill="${shape.fillColor === 'transparent' ? 'none' : shape.fillColor}" stroke-width="${shape.strokeWidth}"/>`;
        } else if (shape.type === 'line' && shape.points.length >= 2) {
          const [p1, p2] = [shape.points[0], shape.points[shape.points.length - 1]];
          svgContent += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${shape.strokeColor}" stroke-width="${shape.strokeWidth}"/>`;
        } else if (shape.type === 'brush' && shape.points.length >= 2) {
          const pathData = shape.points.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(' ');
          svgContent += `<path d="${pathData}" stroke="${shape.strokeColor}" fill="none" stroke-width="${shape.strokeWidth}"/>`;
        } else if (shape.type === 'text' && shape.text) {
          svgContent += `<text x="${shape.points[0].x}" y="${shape.points[0].y}" fill="${shape.strokeColor}" font-size="${shape.fontSize || 16}" font-family="Arial">${shape.text}</text>`;
        }
      });
      
      svgContent += `</svg>`;
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
    } else {
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      link.href = canvas.toDataURL(mimeType, 0.9);
    }
    
    link.click();
    logActivity(`Exported as ${format.toUpperCase()}`);
    addNotification('success', 'Exported!', `Drawing saved as ${format.toUpperCase()}`);
  };

  // Upload to Consultant
  const handleUploadToConsultant = async (consultantId: string) => {
    if (shapes.length === 0) {
      addNotification('warning', 'Empty Drawing', 'Please draw something before sending to consultant.');
      return;
    }

    setUploadingToConsultant(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const consultant = consultants.find(c => c.id === consultantId);
    setUploadingToConsultant(false);
    setUploadSuccess(true);
    logActivity(`Sent to ${consultant?.name}`);
    addNotification('success', 'Drawing Sent!', `Your drawing has been sent to ${consultant?.name} for review.`);
    
    // Reset after showing success
    setTimeout(() => {
      setUploadSuccess(false);
      setShowConsultantModal(false);
      setDrawingNote('');
    }, 2000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      
      // Tool shortcuts
      if (key === 'v') setSelectedTool('select');
      if (key === 'l') setSelectedTool('line');
      if (key === 'r') setSelectedTool('rectangle');
      if (key === 'c') setSelectedTool('circle');
      if (key === 'b') setSelectedTool('brush');
      if (key === 't') setSelectedTool('text');
      if (key === 'e') setSelectedTool('eraser');
      if (key === 'm') setSelectedTool('measure');
      if (key === 'g') setShowGrid(!showGrid);

      // Actions
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && key === 'd') {
        if (selectedShapeId) {
          e.preventDefault();
          handleDuplicateShape();
        }
      }
      if (key === 'delete' || key === 'backspace') {
        if (selectedShapeId) {
          e.preventDefault();
          // Save current state before deleting
          const currentShapes = shapesRef.current || shapes;
          saveState(currentShapes);
          setShapes(prev => {
            const updatedShapes = prev.filter(s => s.id !== selectedShapeId);
            renderCanvas(updatedShapes);
            return updatedShapes;
          });
          setSelectedShapeId(null);
          logActivity('Shape deleted');
        }
      }
      if (key === 'escape') {
        setSelectedShapeId(null);
        setIsDrawing(false);
      }

      // Save/Open/New
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        handleQuickSave();
      }
      if ((e.ctrlKey || e.metaKey) && key === 'o') {
        e.preventDefault();
        setShowOpenModal(true);
      }
      if ((e.ctrlKey || e.metaKey) && key === 'n') {
        e.preventDefault();
        handleNew();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shapes, selectedShapeId, showGrid, currentDrawingId, drawingName]);

  // Initialize native HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      console.warn('Canvas or container not found');
      return;
    }

    // Wait for container to have dimensions
    const initCanvas = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      if (width === 0 || height === 0) {
        console.warn('Container has zero dimensions, retrying...', { width, height });
        setTimeout(initCanvas, 100);
        return;
      }

      try {
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Get 2D context
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get 2D context');
        }
        
        ctxRef.current = ctx;
        console.log('Native canvas initialized successfully', { width, height });
        
        // Initial render
        renderCanvas();

      // Get canvas coordinates from mouse event
      const getCanvasPoint = (e: MouseEvent): { x: number; y: number } => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: (e.clientX - rect.left) * (canvas.width / rect.width),
          y: (e.clientY - rect.top) * (canvas.height / rect.height),
        };
      };

      const handleCanvasMouseDown = (e: MouseEvent) => {
        const tool = selectedToolRef.current;
        
        // Don't process canvas clicks if text input is visible (let user finish typing)
        if (textInputStateRef.current.visible) {
          // Only cancel if clicking with a different tool and not in the process of showing
          if (tool !== 'text' && !isShowingTextInputRef.current) {
            handleTextCancel();
          }
          // Always return to prevent interfering with text input
          return;
        }
        
        const pointer = getCanvasPoint(e);
        const snapped = snapToGrid(pointer);
        
        // Panning with middle mouse (future feature)
        if (e.button === 1) {
          canvas.style.cursor = 'grabbing';
          return;
        }

        if (tool === 'select') {
          // Check if clicking on a resize handle first
          if (selectedShapeId) {
            const selectedShape = shapesRef.current.find(s => s.id === selectedShapeId);
            if (selectedShape) {
              const bounds = getShapeBounds(selectedShape);
              if (bounds) {
                const handle = getHandleAtPoint(bounds, snapped.x, snapped.y);
                if (handle) {
                  // Start resizing
                  drawingStateRef.current.isResizing = true;
                  drawingStateRef.current.resizeHandle = handle;
                  drawingStateRef.current.resizeStartPoint = snapped;
                  drawingStateRef.current.resizeStartBounds = { ...bounds };
                  // Check if Shift is held for aspect ratio lock
                  drawingStateRef.current.maintainAspectRatio = e.shiftKey;
                  // Save state before resize
                  const currentShapes = shapesRef.current || shapes;
                  saveState(currentShapes);
                  setHoveredHandle(handle); // Keep handle highlighted during resize
                  canvas.style.cursor = getResizeCursor(handle);
                  return;
                }
              }
            }
          }

          // Check if clicking on a shape
          const clickedShape = findShapeAtPoint(snapped.x, snapped.y);
          if (clickedShape) {
            setSelectedShapeId(clickedShape.id);
            setHoveredShapeId(null); // Clear hover when selecting
            // Start dragging
            drawingStateRef.current.isDragging = true;
            drawingStateRef.current.draggedShapeId = clickedShape.id;
            const shapeCenter = clickedShape.points[0];
            drawingStateRef.current.dragOffset = {
              x: snapped.x - shapeCenter.x,
              y: snapped.y - shapeCenter.y,
            };
            // Save state before move
            const currentShapes = shapesRef.current || shapes;
            saveState(currentShapes);
          } else {
            setSelectedShapeId(null);
            setHoveredShapeId(null);
          }
          canvas.style.cursor = 'move';
          return;
        }

        if (tool === 'eraser') {
          const clickedShape = findShapeAtPoint(snapped.x, snapped.y);
          if (clickedShape) {
            // Save current state before deleting
            const currentShapes = shapesRef.current || shapes;
            saveState(currentShapes);
            setShapes(prev => {
              const updatedShapes = prev.filter(s => s.id !== clickedShape.id);
              renderCanvas(updatedShapes);
              return updatedShapes;
            });
            addNotification('info', 'Deleted', 'Shape removed');
          }
          return;
        }

        if (tool === 'text') {
          // Cancel any existing text input first
          if (textInputStateRef.current.visible) {
            handleTextCancel();
          }
          // Show text input at clicked position
          const rect = canvas.getBoundingClientRect();
          const screenX = rect.left + snapped.x * (rect.width / canvas.width);
          const screenY = rect.top + snapped.y * (rect.height / canvas.height);
          
          setTextInput({
            visible: true,
            x: screenX,
            y: screenY,
            value: '',
          });
          
          // Focus input after state update with multiple attempts to ensure it works
          setTimeout(() => {
            textInputRef.current?.focus();
            // Try again after a short delay to ensure focus
            setTimeout(() => {
              if (textInputRef.current && document.activeElement !== textInputRef.current) {
                textInputRef.current.focus();
              }
            }, 50);
          }, 10);
          return;
        }

        // Start drawing
        drawingStateRef.current.isDrawing = true;
        isDrawingRef.current = true;
        drawingStateRef.current.startPoint = snapped;
        setCurrentPoints([snapped]);
        currentPointsRef.current = [snapped];
        setSelectedShapeId(null);
        canvas.style.cursor = 'crosshair';
      };

      const handleCanvasMouseMove = (e: MouseEvent) => {
        const state = drawingStateRef.current;
        const tool = selectedToolRef.current;
        const pointer = getCanvasPoint(e);
        const snapped = snapToGrid(pointer);
        
        // Update aspect ratio lock state when Shift is pressed during resize (Canva-style)
        if (state.isResizing) {
          state.maintainAspectRatio = e.shiftKey;
        }

        // Handle resizing
        if (state.isResizing && state.resizeHandle && state.resizeStartBounds && state.resizeStartPoint) {
          const currentShapes = shapesRef.current || shapes;
          const shape = currentShapes.find(s => s.id === selectedShapeId);
          if (shape && state.resizeStartBounds) {
            const dx = snapped.x - state.resizeStartPoint.x;
            const dy = snapped.y - state.resizeStartPoint.y;
            const { x, y, width, height } = state.resizeStartBounds;
            
            let newBounds = { ...state.resizeStartBounds };
            
            // Calculate new bounds based on handle
            const minSize = 10;
            if (state.resizeHandle.includes('w')) {
              newBounds.x = x + dx;
              newBounds.width = width - dx;
              if (newBounds.width < minSize) {
                newBounds.width = minSize;
                newBounds.x = x + width - minSize;
              }
            }
            if (state.resizeHandle.includes('e')) {
              newBounds.width = width + dx;
              if (newBounds.width < minSize) {
                newBounds.width = minSize;
              }
            }
            if (state.resizeHandle.includes('n')) {
              newBounds.y = y + dy;
              newBounds.height = height - dy;
              if (newBounds.height < minSize) {
                newBounds.height = minSize;
                newBounds.y = y + height - minSize;
              }
            }
            if (state.resizeHandle.includes('s')) {
              newBounds.height = height + dy;
              if (newBounds.height < minSize) {
                newBounds.height = minSize;
              }
            }
            
            // Maintain aspect ratio (Canva-style: when Shift is held or for circles from corners)
            const shouldMaintainAspect = state.maintainAspectRatio || 
              (shape.type === 'circle' && (state.resizeHandle === 'nw' || state.resizeHandle === 'ne' || 
                state.resizeHandle === 'sw' || state.resizeHandle === 'se'));
            
            if (shouldMaintainAspect) {
              const aspectRatio = state.resizeStartBounds.width / state.resizeStartBounds.height;
              const isCornerHandle = ['nw', 'ne', 'sw', 'se'].includes(state.resizeHandle);
              
              if (isCornerHandle) {
                // For corner handles, use the larger dimension
                const newSize = Math.max(Math.abs(newBounds.width), Math.abs(newBounds.height));
                newBounds.width = newSize * aspectRatio;
                newBounds.height = newSize;
                
                // Adjust position based on handle
                if (state.resizeHandle.includes('w')) {
                  newBounds.x = x + width - newBounds.width;
                }
                if (state.resizeHandle.includes('n')) {
                  newBounds.y = y + height - newBounds.height;
                }
              } else {
                // For edge handles, maintain aspect ratio
                const avgSize = (Math.abs(newBounds.width) + Math.abs(newBounds.height)) / 2;
                newBounds.width = avgSize * aspectRatio;
                newBounds.height = avgSize;
              }
            }
            
            const resizedShape = applyResize(shape, state.resizeStartBounds, newBounds, state.resizeHandle);
            const updatedShapes = currentShapes.map(s => s.id === selectedShapeId ? resizedShape : s);
            renderCanvas(updatedShapes);
            setShapes(updatedShapes);
          }
          canvas.style.cursor = getResizeCursor(state.resizeHandle);
          return;
        }

        // Update hover state and cursor when hovering over shapes (only when select tool is active)
        if (tool === 'select' && !state.isDragging && !state.isResizing && !state.isDrawing) {
          // First check if hovering over a selected shape's handles
          if (selectedShapeId) {
            const selectedShape = shapesRef.current.find(s => s.id === selectedShapeId);
            if (selectedShape) {
              const bounds = getShapeBounds(selectedShape);
              if (bounds) {
                const handle = getHandleAtPoint(bounds, snapped.x, snapped.y);
                if (handle) {
                  canvas.style.cursor = getResizeCursor(handle);
                  setHoveredHandle(handle);
                  setHoveredShapeId(null); // Clear hover when on handles
                  renderCanvas(); // Re-render to show hover effect
                  return;
                } else {
                  if (hoveredHandle) {
                    setHoveredHandle(null);
                    renderCanvas(); // Re-render to hide hover effect
                  }
                  // Check if inside bounding box for move cursor (Canva-style: only if not on border)
                  const borderThreshold = 5;
                  const isOnBorder = 
                    (Math.abs(snapped.x - bounds.x) < borderThreshold) ||
                    (Math.abs(snapped.x - (bounds.x + bounds.width)) < borderThreshold) ||
                    (Math.abs(snapped.y - bounds.y) < borderThreshold) ||
                    (Math.abs(snapped.y - (bounds.y + bounds.height)) < borderThreshold);
                  
                  if (!isOnBorder && 
                      snapped.x >= bounds.x && snapped.x <= bounds.x + bounds.width &&
                      snapped.y >= bounds.y && snapped.y <= bounds.y + bounds.height) {
                    canvas.style.cursor = 'move';
                    setHoveredShapeId(null); // Clear hover when on selected shape
                    return;
                  }
                }
              }
            }
          }
          
          // Check if hovering over any shape (for preview bounding box)
          const hoveredShape = findShapeAtPoint(snapped.x, snapped.y);
          if (hoveredShape && hoveredShape.id !== selectedShapeId) {
            setHoveredShapeId(hoveredShape.id);
            if (hoveredHandle) {
              setHoveredHandle(null);
            }
            canvas.style.cursor = 'pointer';
            renderCanvas(); // Re-render to show hover preview
            return;
          } else {
            if (hoveredShapeId !== null) {
              setHoveredShapeId(null);
              renderCanvas(); // Re-render to hide hover preview
            }
            if (hoveredHandle) {
              setHoveredHandle(null);
              renderCanvas(); // Re-render to hide handle hover
            }
            canvas.style.cursor = 'default';
          }
        } else {
          // Clear hover when not using select tool
          if (hoveredShapeId !== null) {
            setHoveredShapeId(null);
          }
          if (hoveredHandle !== null) {
            setHoveredHandle(null);
          }
        }

        // Handle dragging
        if (state.isDragging && state.draggedShapeId) {
          setShapes(prev => {
            const shape = prev.find(s => s.id === state.draggedShapeId);
            if (shape) {
              const dx = snapped.x - state.dragOffset.x - shape.points[0].x;
              const dy = snapped.y - state.dragOffset.y - shape.points[0].y;
              const updatedShapes = prev.map(s => 
                s.id === state.draggedShapeId
                  ? { ...s, points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy })) }
                  : s
              );
              // Render with updated shapes immediately
              renderCanvas(updatedShapes);
              return updatedShapes;
            }
            return prev;
          });
          canvas.style.cursor = 'grabbing';
          return;
        }

        // Eraser tool hover feedback
        if (tool === 'eraser' && !state.isDrawing) {
          const hoveredShape = findShapeAtPoint(snapped.x, snapped.y);
          if (hoveredShape) {
            canvas.style.cursor = 'pointer';
            // Highlight the shape that will be deleted
            renderCanvas();
            const ctx = ctxRef.current;
            if (ctx && hoveredShape) {
              ctx.save();
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 3;
              ctx.setLineDash([4, 4]);
              
              if (hoveredShape.type === 'rectangle' && hoveredShape.points.length >= 2) {
                const [p1, p2] = [hoveredShape.points[0], hoveredShape.points[hoveredShape.points.length - 1]];
                const x = Math.min(p1.x, p2.x);
                const y = Math.min(p1.y, p2.y);
                const width = Math.abs(p2.x - p1.x);
                const height = Math.abs(p2.y - p1.y);
                ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
              } else if (hoveredShape.type === 'circle' && hoveredShape.points.length >= 2) {
                const [c, e] = [hoveredShape.points[0], hoveredShape.points[hoveredShape.points.length - 1]];
                const rx = Math.abs(e.x - c.x) + 2;
                const ry = Math.abs(e.y - c.y) + 2;
                ctx.beginPath();
                ctx.ellipse(c.x, c.y, rx, ry, 0, 0, 2 * Math.PI);
                ctx.stroke();
              } else if (hoveredShape.type === 'line' && hoveredShape.points.length >= 2) {
                const [p1, p2] = [hoveredShape.points[0], hoveredShape.points[hoveredShape.points.length - 1]];
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              } else if (hoveredShape.type === 'brush' && hoveredShape.points.length >= 2) {
                // Highlight brush path
                ctx.beginPath();
                ctx.moveTo(hoveredShape.points[0].x, hoveredShape.points[0].y);
                for (let i = 1; i < hoveredShape.points.length; i++) {
                  ctx.lineTo(hoveredShape.points[i].x, hoveredShape.points[i].y);
                }
                ctx.stroke();
              } else if (hoveredShape.type === 'text' && hoveredShape.points.length > 0) {
                const p = hoveredShape.points[0];
                const fontSize = hoveredShape.fontSize || 16;
                const textWidth = (hoveredShape.text?.length || 0) * fontSize * 0.6;
                const textHeight = fontSize;
                ctx.strokeRect(p.x - 4, p.y - textHeight - 4, textWidth + 8, textHeight + 8);
              }
              
              ctx.restore();
            }
          } else {
            canvas.style.cursor = 'pointer';
            renderCanvas();
          }
          return;
        }

        // Handle drawing
        if (!state.isDrawing || !state.startPoint) return;

        const endPoint = snapped;

        // Update currentPoints for all tools (needed for endPoint in mouseUp)
        // Only update state for brush (to avoid unnecessary re-renders during drawing)
        if (tool === 'rectangle' || tool === 'circle' || tool === 'line') {
          // Just update ref, don't trigger state update during drawing
          currentPointsRef.current = [state.startPoint, endPoint];
        } else if (tool === 'brush') {
          const currentPts = currentPointsRef.current;
          const newPoints = [...currentPts, endPoint];
          // Update both ref and state for brush (needed for continuous drawing)
          currentPointsRef.current = newPoints;
          setCurrentPoints(newPoints);
        }

        // Render preview (temporary shape) - use ref to get latest shapes
        renderCanvas();
        const ctx = ctxRef.current;
        if (ctx) {
          ctx.save();
          // Enhanced preview with better visibility
          ctx.strokeStyle = strokeColorRef.current;
          ctx.fillStyle = fillColorRef.current === 'transparent' 
            ? 'transparent' 
            : fillColorRef.current.replace('40', '60'); // More visible fill
          ctx.lineWidth = strokeWidthRef.current + 0.5; // Slightly thicker for preview
          ctx.globalAlpha = 0.8; // Semi-transparent for preview
          ctx.setLineDash([]); // Solid line for better visibility

          if (tool === 'rectangle') {
            const left = Math.min(state.startPoint.x, endPoint.x);
            const top = Math.min(state.startPoint.y, endPoint.y);
            const width = Math.abs(endPoint.x - state.startPoint.x);
            const height = Math.abs(endPoint.y - state.startPoint.y);
            if (width > 0 && height > 0) {
              ctx.fillRect(left, top, width, height);
              ctx.strokeRect(left, top, width, height);
            }
          } else if (tool === 'circle') {
            const rx = Math.abs(endPoint.x - state.startPoint.x);
            const ry = Math.abs(endPoint.y - state.startPoint.y);
            if (rx > 0 || ry > 0) {
              ctx.beginPath();
              ctx.ellipse(state.startPoint.x, state.startPoint.y, rx, ry, 0, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
            }
          } else if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(state.startPoint.x, state.startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
          } else if (tool === 'brush' && currentPointsRef.current.length >= 2) {
            ctx.globalAlpha = 1; // Full opacity for brush
            ctx.beginPath();
            ctx.moveTo(currentPointsRef.current[0].x, currentPointsRef.current[0].y);
            for (let i = 1; i < currentPointsRef.current.length; i++) {
              ctx.lineTo(currentPointsRef.current[i].x, currentPointsRef.current[i].y);
            }
            ctx.stroke();
          }

          ctx.restore();
        }

        // Update measure distance
        if (tool === 'measure' && state.startPoint) {
          const dist = Math.sqrt(Math.pow(endPoint.x - state.startPoint.x, 2) + Math.pow(endPoint.y - state.startPoint.y, 2)) / gridSize;
          setMeasureDistance(dist);
        }
      };

      const handleCanvasMouseUp = (e: MouseEvent) => {
        const state = drawingStateRef.current;
        const tool = selectedToolRef.current;

        // Handle resizing end
        if (state.isResizing) {
          state.isResizing = false;
          state.resizeHandle = null;
          state.resizeStartPoint = null;
          state.resizeStartBounds = null;
          state.maintainAspectRatio = false;
          setHoveredHandle(null); // Clear hover state
          // Update shapes ref after resize
          const currentShapes = shapesRef.current || shapes;
          setShapes([...currentShapes]);
          canvas.style.cursor = 'move';
          return;
        }

        // Handle dragging end
        if (state.isDragging) {
          state.isDragging = false;
          state.draggedShapeId = null;
          state.dragOffset = { x: 0, y: 0 };
          // Update shapes ref after drag
          const currentShapes = shapesRef.current || shapes;
          setShapes([...currentShapes]);
          return;
        }

        if (!state.isDrawing || !state.startPoint) {
          state.isDrawing = false;
          isDrawingRef.current = false;
          return;
        }

        const pointer = getCanvasPoint(e);
        const endPoint = snapToGrid(pointer);

        if (tool === 'measure') {
          state.isDrawing = false;
          isDrawingRef.current = false;
          state.startPoint = null;
          setCurrentPoints([]);
          currentPointsRef.current = [];
          setMeasureDistance(null);
          return;
        }

        // Create final shape
        if (tool === 'rectangle' || tool === 'circle' || tool === 'line' || tool === 'brush') {
          // For brush, use all collected points; for others, use start and end
          const points = tool === 'brush' ? currentPointsRef.current : [state.startPoint, endPoint];
          
          // Check minimum size (except for brush)
          if (tool !== 'brush') {
            const minSize = tool === 'line' ? 5 : 2;
            const dist = Math.sqrt(Math.pow(endPoint.x - state.startPoint.x, 2) + Math.pow(endPoint.y - state.startPoint.y, 2));
            
            if (dist < minSize) {
              state.isDrawing = false;
              isDrawingRef.current = false;
              state.startPoint = null;
              setCurrentPoints([]);
              currentPointsRef.current = [];
              renderCanvas();
              return;
            }
          }

          // Only create shape if brush has enough points
          if (tool === 'brush' && points.length < 2) {
            state.isDrawing = false;
            isDrawingRef.current = false;
            state.startPoint = null;
            setCurrentPoints([]);
            currentPointsRef.current = [];
            renderCanvas();
            return;
          }

          // Save current state before adding new shape
          const currentShapes = shapesRef.current || shapes;
          saveState(currentShapes);
          
          const shapeId = `shape-${Date.now()}`;
          const newShape: Shape = {
            id: shapeId,
            type: tool,
            points,
            strokeColor: strokeColorRef.current,
            fillColor: fillColorRef.current,
            strokeWidth: strokeWidthRef.current,
          };

          // Update shapes state and render immediately with the new shape
          setShapes(prev => {
            const updatedShapes = [...prev, newShape];
            // Render with updated shapes immediately (before state update completes)
            renderCanvas(updatedShapes);
            return updatedShapes;
          });
        }

        // Reset drawing state
        state.isDrawing = false;
        isDrawingRef.current = false;
        state.startPoint = null;
        setCurrentPoints([]);
        currentPointsRef.current = [];
        setMeasureDistance(null);
        
        // Update cursor based on tool
        const currentTool = selectedToolRef.current;
        if (currentTool === 'select') {
          canvas.style.cursor = 'move';
        } else if (currentTool === 'eraser') {
          canvas.style.cursor = 'pointer';
        } else if (currentTool === 'text') {
          canvas.style.cursor = 'text';
        } else {
          canvas.style.cursor = 'crosshair';
        }
      };

      // Attach event listeners
      canvas.addEventListener('mousedown', handleCanvasMouseDown);
      canvas.addEventListener('mousemove', handleCanvasMouseMove);
      canvas.addEventListener('mouseup', handleCanvasMouseUp);
      canvas.addEventListener('mouseleave', () => {
        // Reset drawing state on mouse leave
        drawingStateRef.current.isDrawing = false;
        drawingStateRef.current.isDragging = false;
        drawingStateRef.current.isResizing = false;
        isDrawingRef.current = false;
        setHoveredShapeId(null); // Clear hover on mouse leave
        renderCanvas();
      });

      // Handle resize
      const resize = () => {
        if (canvas && container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctxRef.current = ctx;
            renderCanvas();
          }
        }
      };

      resize();
      window.addEventListener('resize', resize);

      return () => {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousedown', handleCanvasMouseDown);
        canvas.removeEventListener('mousemove', handleCanvasMouseMove);
        canvas.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    } catch (error) {
      console.error('Error initializing canvas:', error);
      addNotification('error', 'Canvas Error', 'Failed to initialize drawing board. Please refresh the page.');
    }
    };

    // Start initialization
    initCanvas();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Grid is handled in renderCanvas, no separate effect needed


  const snapToGrid = (pos: { x: number; y: number }) => {
    if (!showGrid) return pos;
    return {
      x: Math.round(pos.x / gridSize) * gridSize,
      y: Math.round(pos.y / gridSize) * gridSize,
    };
  };





  const currentToolData = tools.find(t => t.id === selectedTool);
  const selectedShape = shapes.find(s => s.id === selectedShapeId);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Bar - Concise */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded">
            <Menu size={18} />
          </button>
          <h1 className="text-base font-medium text-gray-700 hidden sm:block truncate max-w-xs">
            {drawingName || 'Drawing'}
          </h1>
          <div className="flex items-center gap-1 ml-1">
            <button onClick={handleNew} className="p-1.5 hover:bg-gray-100 rounded" title="New Drawing (Ctrl+N)">
              <FilePlus size={16} />
            </button>
            <button onClick={handleUndo} disabled={undoStack.length === 0} className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30" title="Undo">
              <Undo2 size={16} />
            </button>
            <button onClick={handleRedo} disabled={redoStack.length === 0} className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30" title="Redo">
              <Redo2 size={16} />
            </button>
            <button onClick={handleClearCanvas} disabled={shapes.length === 0} className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30" title="Clear Canvas">
              <Trash2 size={16} />
            </button>
            <button onClick={handleQuickSave} className="p-1.5 hover:bg-gray-100 rounded" title="Save">
              <Save size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              title="Export Drawing"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
                  <button
                    onClick={() => {
                      handleExport('png');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg"
                  >
                    Export as PNG
                  </button>
                  <button
                    onClick={() => {
                      handleExport('jpg');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Export as JPG
                  </button>
                  <button
                    onClick={() => {
                      handleExport('svg');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-b-lg"
                  >
                    Export as SVG
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Share Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5"
              title="Share Drawing"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
              <ChevronDown size={14} />
            </button>
            {showShareMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
                  <button
                    onClick={() => {
                      setShowConsultantModal(true);
                      setShowShareMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
                  >
                    <Send size={14} />
                    Send to Consultant
                  </button>
                  <Link
                    to="/chat"
                    onClick={() => {
                      // Store drawing data for chat
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const imageData = canvas.toDataURL('image/png');
                        localStorage.setItem('keyvasthu_share_drawing', JSON.stringify({
                          imageData,
                          shapes,
                          name: drawingName || 'My Drawing',
                          timestamp: new Date().toISOString(),
                        }));
                      }
                      setShowShareMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
                  >
                    <MessageCircle size={14} />
                    Share in Chat
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Tool Sidebar - Concise */}
        <AnimatePresence>
          {(showLeftPanel || showMobileMenu) && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 60, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={cn(
                'bg-white border-r border-gray-200 flex flex-col py-1 overflow-hidden',
                showMobileMenu && 'fixed left-0 top-12 bottom-0 z-40 lg:relative lg:top-0'
              )}
            >
              <div className="px-1 space-y-0.5 flex-1 overflow-y-auto">
                {orderedTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => { setSelectedTool(tool.id); setShowMobileMenu(false); }}
                    className={cn(
                      'w-full flex flex-col items-center gap-0.5 p-1.5 rounded transition-all',
                      selectedTool === tool.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                    title={tool.label}
                  >
                    <tool.icon size={20} strokeWidth={selectedTool === tool.id ? 2.5 : 2} />
                    <span className="text-[9px] leading-tight">{tool.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
              <div className="px-1 pt-1 border-t border-gray-200">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={cn(
                    'w-full flex flex-col items-center gap-0.5 p-1.5 rounded transition-all',
                    showGrid ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}
                  title="Grid"
                >
                  <Grid3X3 size={18} strokeWidth={showGrid ? 2.5 : 2} />
                  <span className="text-[9px]">Grid</span>
                </button>
              </div>

              {/* Panel toggle - desktop only */}
              <button
                onClick={() => setShowLeftPanel(false)}
                className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-gray-200 rounded-r items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft size={12} />
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Collapsed left panel toggle */}
        {!showLeftPanel && (
          <button
            onClick={() => setShowLeftPanel(true)}
            className="hidden lg:flex w-4 bg-white border-r border-gray-200 items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <ChevronRight size={12} />
          </button>
        )}

        {/* Center Canvas Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gray-50">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />

            {/* Compass Background Watermark */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              style={{ opacity: 0.08 }}
            >
              <img
                src={getR2AssetUrl('vasthu-plan.png', '')}
                alt="Vasthu Compass"
                className="object-contain"
                style={{
                  width: '900px',
                  height: '900px',
                  maxWidth: '70%',
                  maxHeight: '70%',
                }}
              />
            </div>

            {/* Text Input - Direct Entry */}
            {textInput.visible && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                style={{
                  position: 'absolute',
                  left: `${textInput.x}px`,
                  top: `${textInput.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                  pointerEvents: 'auto',
                }}
              >
                <input
                  ref={textInputRef}
                  type="text"
                  value={textInput.value}
                  onChange={(e) => {
                    e.stopPropagation();
                    setTextInput(prev => ({ ...prev, value: e.target.value }));
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTextSubmit(textInput.value, textInput.x, textInput.y);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleTextCancel();
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onFocus={(e) => {
                    e.stopPropagation();
                  }}
                  onBlur={(e) => {
                    e.stopPropagation();
                    // Use a longer delay to prevent immediate cancellation
                    // Only process blur if input was actually used (not just shown)
                    const currentValue = textInput.value;
                    setTimeout(() => {
                      // Check if input is still visible and actually blurred
                      if (!textInputStateRef.current.visible) {
                        return; // Already handled
                      }
                      // Don't process if input regained focus
                      if (document.activeElement === textInputRef.current) {
                        return;
                      }
                      // Don't process if we're still in the process of showing
                      if (isShowingTextInputRef.current) {
                        return;
                      }
                      // Submit or cancel based on content
                      if (currentValue.trim()) {
                        handleTextSubmit(currentValue, textInput.x, textInput.y);
                      } else {
                        handleTextCancel();
                      }
                    }, 200);
                  }}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: 'Arial',
                    color: strokeColor,
                    background: 'white',
                    border: `2px solid ${strokeColor}`,
                    borderRadius: '4px',
                    padding: '4px 8px',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    minWidth: '120px',
                    pointerEvents: 'auto',
                  }}
                  placeholder="Type text..."
                  autoFocus
                />
              </div>
            )}

            {/* Floating Toolbar for Selected Shape */}
            {selectedShapeId && selectedTool === 'select' && (() => {
              const selectedShape = shapes.find(s => s.id === selectedShapeId);
              if (!selectedShape) return null;
              
              const bounds = getShapeBounds(selectedShape);
              if (!bounds) return null;
              
              const canvas = canvasRef.current;
              if (!canvas) return null;
              
              // Convert canvas coordinates to screen coordinates
              const rect = canvas.getBoundingClientRect();
              const scaleX = rect.width / canvas.width;
              const scaleY = rect.height / canvas.height;
              
              // Calculate center of selection in screen coordinates
              const centerX = rect.left + bounds.x * scaleX + (bounds.width * scaleX) / 2;
              const topY = rect.top + bounds.y * scaleY;
              
              // Position toolbar above the selection, but show below if not enough space
              const toolbarOffset = 45; // 45px above the selection
              const toolbarY = Math.max(rect.top + 10, topY - toolbarOffset);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'fixed',
                    left: `${centerX}px`,
                    top: `${toolbarY}px`,
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    pointerEvents: 'auto',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 flex items-center gap-1 p-1"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDuplicateShape();
                    }}
                    className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                    title="Duplicate (Ctrl+D)"
                  >
                    <Copy size={16} className="text-gray-700" />
                  </button>
                  <div className="w-px h-6 bg-gray-200" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteSelectedShape();
                    }}
                    className="p-2 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </motion.div>
              );
            })()}

            {/* Direction Labels - Simple N S E W */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded shadow-md z-10">
              N
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-700 text-white text-sm font-bold rounded shadow-md z-10">
              S
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-700 text-white text-sm font-bold rounded shadow-md z-10">
              W
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-700 text-white text-sm font-bold rounded shadow-md z-10">
              E
            </div>

            {/* Quick measure display */}
            {measureDistance !== null && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-orange-500 text-white text-sm font-semibold rounded-lg shadow-lg z-20">
                {measureDistance.toFixed(1)} ft
              </div>
            )}
          </div>

          {/* Bottom Status Bar - Concise */}
          <div className="h-6 bg-white border-t border-gray-200 flex items-center justify-between px-2 text-[10px] text-gray-500">
            <span>{currentToolData?.label}</span>
            <span>{shapes.length} shapes</span>
          </div>
        </main>

        {/* Right Properties Panel - Concise */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:flex flex-col bg-white border-l border-gray-200 overflow-hidden"
            >
              <div className="p-2 border-b border-gray-200">
                <h2 className="text-xs font-semibold text-gray-700">Properties</h2>
              </div>

              {/* Saved Drawings - Compact */}
              <div className="border-b border-gray-200">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                      <FolderOpen size={10} />
                      Saved
                    </h3>
                    <button
                      onClick={() => setShowOpenModal(true)}
                      className="text-[9px] text-blue-600 hover:underline"
                    >
                      All
                    </button>
                  </div>
                  
                  {savedDrawings.length === 0 ? (
                    <div className="text-center py-3">
                      <FolderOpen size={16} className="text-gray-300 mx-auto mb-1" />
                      <p className="text-[9px] text-gray-400">No saved files</p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {savedDrawings.slice(0, 5).map((drawing) => (
                        <div
                          key={drawing.id}
                          className={cn(
                            'w-full flex items-center gap-1.5 p-1 rounded group transition-colors',
                            currentDrawingId === drawing.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          )}
                        >
                          {/* Clickable area to open */}
                          <button
                            onClick={() => handleOpenDrawing(drawing)}
                            className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                          >
                            {/* Thumbnail */}
                            <div className="w-6 h-6 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                              {drawing.thumbnail ? (
                                <img src={drawing.thumbnail} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Grid3X3 size={10} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-800 truncate">{drawing.name}</p>
                              <p className="text-[8px] text-gray-500">
                                {drawing.shapes.length} shapes
                              </p>
                            </div>
                          </button>
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDrawing(drawing.id, drawing.name);
                            }}
                            className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            title="Delete drawing"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {savedDrawings.length > 5 && (
                        <button
                          onClick={() => setShowOpenModal(true)}
                          className="w-full text-center text-[9px] text-blue-600 hover:underline py-1"
                        >
                          +{savedDrawings.length - 5} more
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {/* Stroke Color */}
                <div>
                  <label className="text-[10px] font-medium text-gray-600 mb-1 block">Color</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {colorPresets.map(color => (
                      <button
                        key={color}
                        onClick={() => setStrokeColor(color)}
                        className={cn(
                          'w-6 h-6 rounded border transition-all',
                          strokeColor === color ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-300'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-6 rounded cursor-pointer border border-gray-300"
                  />
                </div>

                {/* Fill Color */}
                {(selectedTool === 'rectangle' || selectedTool === 'circle') && (
                  <div>
                    <label className="text-[10px] font-medium text-gray-600 mb-1 block">Fill</label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setFillColor('transparent')}
                        className={cn(
                          'w-6 h-6 rounded border bg-[repeating-conic-gradient(#ddd_0_25%,white_0_50%)] bg-[length:4px_4px]',
                          fillColor === 'transparent' ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-300'
                        )}
                      />
                      {colorPresets.map(color => (
                        <button
                          key={`fill-${color}`}
                          onClick={() => setFillColor(color + '40')}
                          className={cn(
                            'w-6 h-6 rounded border',
                            fillColor === color + '40' ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-300'
                          )}
                          style={{ backgroundColor: color + '40' }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Stroke Width */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-medium text-gray-600">Width</label>
                    <span className="text-[10px] text-gray-700">{strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Font Size */}
                {selectedTool === 'text' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-medium text-gray-600">Size</label>
                      <span className="text-[10px] text-gray-700">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}

                {/* Selected shape info */}
                {selectedShape && (
                  <div className="p-1.5 bg-blue-50 rounded border border-blue-200">
                    <p className="text-[10px] font-medium text-blue-800">Selected: {selectedShape.type}</p>
                  </div>
                )}
              </div>

              {/* Panel toggle */}
              <button
                onClick={() => setShowRightPanel(false)}
                className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-gray-200 rounded-l flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <ChevronRight size={12} />
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Collapsed right panel toggle */}
        {!showRightPanel && (
          <button
            onClick={() => setShowRightPanel(true)}
            className="hidden lg:flex w-4 bg-white border-l border-gray-200 items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft size={12} />
          </button>
        )}
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* Keyboard shortcuts modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Keyboard Shortcuts</h2>
                <button onClick={() => setShowShortcuts(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-500 uppercase">Tools</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {tools.map(tool => (
                    <div key={tool.id} className="flex items-center justify-between py-1">
                      <span className="text-gray-600">{tool.label}</span>
                      <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{tool.shortcut}</kbd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Toggle Grid</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">G</kbd>
                  </div>
                </div>
                
                <div className="text-xs font-medium text-gray-500 uppercase mt-4">Actions</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Undo</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+Z</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Redo</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+Y</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Delete</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Del</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Zoom In</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl++</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Zoom Out</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+-</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Save</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+S</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Open</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+O</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Cancel</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Esc</kbd>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Send to Consultant Modal */}
        {showConsultantModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !uploadingToConsultant && setShowConsultantModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Send size={24} />
                    <h2 className="text-lg font-bold">Send to Consultant</h2>
                  </div>
                  {!uploadingToConsultant && (
                    <button onClick={() => setShowConsultantModal(false)} className="p-1 hover:bg-white/20 rounded">
                      <X size={20} />
                    </button>
                  )}
                </div>
                <p className="text-green-100 text-sm mt-1">Share your drawing for expert Vasthu analysis</p>
              </div>

              {/* Success State */}
              {uploadSuccess ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Drawing Sent!</h3>
                  <p className="text-gray-600">Your consultant will review it shortly.</p>
                </div>
              ) : (
                <>
                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Drawing Preview */}
                    <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-16 h-16 bg-white rounded border flex items-center justify-center">
                        <Grid3X3 size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Current Drawing</p>
                        <p className="text-sm text-gray-500">{shapes.length} shapes • {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Note Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Add a Note (Optional)</label>
                      <textarea
                        value={drawingNote}
                        onChange={(e) => setDrawingNote(e.target.value)}
                        placeholder="e.g., Please check the bedroom placement in the SW corner..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                      />
                    </div>

                    {/* Select Consultant */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Consultant</label>
                      <div className="space-y-2">
                        {consultants.map((consultant) => (
                          <button
                            key={consultant.id}
                            onClick={() => handleUploadToConsultant(consultant.id)}
                            disabled={uploadingToConsultant}
                            className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                              {consultant.avatar}
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-medium text-gray-800">{consultant.name}</p>
                              <p className="text-xs text-gray-500">{consultant.specialty}</p>
                            </div>
                            <Send size={16} className="text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                    <Link to="/chat" className="text-sm text-green-600 hover:underline flex items-center gap-1">
                      <MessageCircle size={14} />
                      Or chat directly
                    </Link>
                    <button
                      onClick={() => setShowConsultantModal(false)}
                      disabled={uploadingToConsultant}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* Loading Overlay */}
              {uploadingToConsultant && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Sending drawing...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* New Drawing Modal */}
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FilePlus size={24} />
                    <h2 className="text-lg font-bold">New Drawing</h2>
                  </div>
                  <button onClick={() => setShowNewModal(false)} className="p-1 hover:bg-white/20 rounded">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-emerald-100 text-sm mt-1">Start a fresh drawing with a name</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drawing Name</label>
                  <input
                    type="text"
                    value={newDrawingName}
                    onChange={(e) => setNewDrawingName(e.target.value)}
                    placeholder="e.g., My House Plan, Office Layout..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNewDrawing(newDrawingName);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">Give your drawing a meaningful name to find it easily later.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="flex-1 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCreateNewDrawing(newDrawingName)}
                    className="flex-1 px-4 py-2.5 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FilePlus size={16} />
                    Create Drawing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Save As Modal */}
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Save size={24} />
                    <h2 className="text-lg font-bold">Save Drawing</h2>
                  </div>
                  <button onClick={() => setShowSaveModal(false)} className="p-1 hover:bg-white/20 rounded">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-blue-100 text-sm mt-1">Save your drawing to access it later</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drawing Name</label>
                  <input
                    type="text"
                    value={drawingName}
                    onChange={(e) => setDrawingName(e.target.value)}
                    placeholder="e.g., My House Plan, Office Layout..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveDrawing(drawingName);
                    }}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white rounded border flex items-center justify-center">
                    <Grid3X3 size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{shapes.length} shapes</p>
                    <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveDrawing(drawingName)}
                    className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Save Drawing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Open Drawing Modal */}
        {showOpenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOpenModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderOpen size={24} />
                    <h2 className="text-lg font-bold">Open Drawing</h2>
                  </div>
                  <button onClick={() => setShowOpenModal(false)} className="p-1 hover:bg-white/20 rounded">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-purple-100 text-sm mt-1">Select a saved drawing to continue working on</p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {savedDrawings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FolderOpen size={28} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Saved Drawings</h3>
                    <p className="text-gray-500 text-sm">Start drawing and save your work to see it here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedDrawings.map((drawing) => (
                      <div
                        key={drawing.id}
                        className={cn(
                          'border rounded-lg overflow-hidden hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group',
                          currentDrawingId === drawing.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        )}
                      >
                        {/* Thumbnail */}
                        <div 
                          className="h-32 bg-gray-100 flex items-center justify-center"
                          onClick={() => handleOpenDrawing(drawing)}
                        >
                          {drawing.thumbnail ? (
                            <img src={drawing.thumbnail} alt={drawing.name} className="w-full h-full object-cover" />
                          ) : (
                            <Grid3X3 size={32} className="text-gray-300" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0" onClick={() => handleOpenDrawing(drawing)}>
                              <h4 className="font-medium text-gray-800 truncate">{drawing.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {drawing.shapes.length} shapes • {new Date(drawing.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteDrawing(drawing.id, drawing.name); }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete drawing"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          
                          {currentDrawingId === drawing.id && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              Currently Open
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                <button
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrawingBoard;
