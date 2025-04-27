import React, { useState, useEffect } from 'react';

const SubsetVisualizer = () => {
  const [array, setArray] = useState(['A', 'B', 'C', 'D']);
  const [subsetLength, setSubsetLength] = useState(2);
  const [subsets, setSubsets] = useState([]);
  const [currentState, setCurrentState] = useState({
    path: [],
    index: 0,
    activeSubset: [],
    resultArray: [],
    currentArrayHistory: []
  });
  const [speed, setSpeed] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [treeData, setTreeData] = useState(null);

  // Generate all possible subsets
  const generateSubsets = (arr, length) => {
    const result = [];
    const allSteps = [];
    const treeNodes = [];
    
    const dfs = (i, currentArray, path = [], depth = 0, parentId = null) => {
      const nodeId = `node-${treeNodes.length}`;
      
      // Clone current state for visualization
      const stepState = {
        index: i,
        currentArray: [...currentArray],
        result: [...result],
        path: [...path, nodeId],
        depth: depth,
        resultArray: [...result], // Track result array at each step
        currentArrayHistory: [...currentArray] // Track current array at each step
      };
      
      treeNodes.push({
        id: nodeId,
        parentId: parentId,
        value: currentArray.length > 0 ? currentArray[currentArray.length - 1] : 'root',
        depth: depth,
        children: []
      });
      
      // If parent exists, add this as a child
      if (parentId !== null) {
        const parentNode = treeNodes.find(node => node.id === parentId);
        if (parentNode) {
          parentNode.children.push(nodeId);
        }
      }
      
      // Record this step
      allSteps.push(stepState);
      
      // Base case: we have a subset of the desired length
      if (currentArray.length === length) {
        result.push([...currentArray]);
        return;
      }
      
      // Base case: we've gone through all elements
      if (i >= arr.length) {
        return;
      }
      
      for (let j = i; j < arr.length; j++) {
        currentArray.push(arr[j]);
        dfs(j + 1, currentArray, [...path, nodeId], depth + 1, nodeId);
        currentArray.pop();
      }
    };
    
    dfs(0, [], [], 0, null);
    
    const processedTreeData = buildTreeHierarchy(treeNodes);
    
    return { subsets: result, steps: allSteps, treeData: processedTreeData };
  };
  
  const buildTreeHierarchy = (nodes) => {
    const rootNode = nodes.find(node => node.parentId === null);
    if (!rootNode) return null;
    
    const buildTree = (node) => {
      const nodeChildren = nodes.filter(n => n.parentId === node.id);
      return {
        ...node,
        children: nodeChildren.map(buildTree)
      };
    };
    
    return buildTree(rootNode);
  };

  const restart = () => {
    const { subsets: newSubsets, steps: newSteps, treeData: newTreeData } = generateSubsets(array, subsetLength);
    setSubsets(newSubsets);
    setSteps(newSteps);
    setTreeData(newTreeData);
    setCurrentStep(0);
    setCurrentState({
      path: [],
      index: 0,
      activeSubset: []
    });
    setIsRunning(false);
  };

  const handleArrayChange = (e) => {
    const newArray = e.target.value.split(',').map(item => item.trim());
    setArray(newArray);
  };

  const handleLengthChange = (e) => {
    const length = parseInt(e.target.value);
    if (!isNaN(length) && length >= 0 && length <= array.length) {
      setSubsetLength(length);
    }
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      const step = steps[currentStep + 1];
      setCurrentState({
        path: step.path,
        index: step.index,
        activeSubset: step.currentArray,
        resultArray: step.resultArray || [],
        currentArrayHistory: step.currentArrayHistory|| []
      });
    }
  };

  // Step backward manually
  const stepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      
      const step = steps[currentStep - 1];
      setCurrentState({
        path: step.path,
        index: step.index,
        activeSubset: step.currentArray,
        resultArray: step.resultArray || [],
        currentArrayHistory: step.currentArrayHistory || []
      });
    }
  };

  // Effect for auto-stepping through visualization
  useEffect(() => {
    let timer;
    if (isRunning && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        stepForward();
      }, speed);
    } else if (currentStep >= steps.length - 1) {
      setIsRunning(false);
    }
    
    return () => clearTimeout(timer);
  }, [isRunning, currentStep, steps.length, speed]);

  // Initialize the visualization
  useEffect(() => {
    restart();
  }, [array, subsetLength]);

  // Render a tree node recursively
  const renderTreeNode = (node) => {
    if (!node) return null;
    
    const isActive = currentState.path.includes(node.id);
    const isLeaf = node.children && node.children.length === 0;
    
    return (
      <div key={node.id} className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 mb-2 ${
          isActive ? 'bg-blue-500 text-white border-blue-700' : 
          isLeaf ? 'border-gray-400' : 'border-gray-400'
        }`}>
          {node.value !== 'root' ? node.value : ''}
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="flex space-x-4 mt-2">
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold">Subset Generation Visualization</h2>
        
        <h3 className="text-xl font-bold">This is a visualization for LeetCode #78. Can also serve as visualization for some Backtracking recursion problems!</h3>
        <div className="flex flex-col space-y-2">
          <label className="font-medium">Input Array (comma-separated):</label>
          <input 
            type="text" 
            value={array.join(',')} 
            onChange={handleArrayChange}
            className="border rounded p-2"
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="font-medium">Subset Length:</label>
          <input 
            type="number" 
            min="0" 
            max={array.length} 
            value={subsetLength} 
            onChange={handleLengthChange}
            className="border rounded p-2"
          />
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={toggleRunning} 
            className={`px-4 py-2 rounded ${isRunning ? 'bg-red-500' : 'bg-green-500'} text-white`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          
          <button 
            onClick={stepBackward} 
            disabled={currentStep <= 0}
            className="px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          <button 
            onClick={stepForward} 
            disabled={currentStep >= steps.length - 1}
            className="px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
          
          <button 
            onClick={restart}
            className="px-4 py-2 rounded bg-blue-500 text-white"
          >
            Restart
          </button>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="font-medium">Animation Speed:</label>
          <input 
            type="range" 
            min="200" 
            max="2000" 
            step="100"
            value={speed} 
            onChange={(e) => setSpeed(parseInt(e.target.value))}
          />
          <span>{speed}ms per step</span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium">Current State:</h3>
        <div className="p-4 border rounded">
          <p><strong>Step:</strong> {currentStep + 1} / {steps.length}</p>
          <p><strong>Index:</strong> {currentState.index}</p>
          <p><strong>Current Subset:</strong> [{currentState.activeSubset.join(', ')}]</p>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium">Arrays History:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h4 className="font-medium mb-2">Current Array History:</h4>
            <div className="p-2 rounded">
              {currentState.currentArray && currentState.currentArray.map((item, idx) => (
                <div key={idx} className="mb-1">
                  Step {idx + 1}: [{item}]
                </div>
              ))}
              {(!currentState.currentArray || currentState.currentArray.length === 0) && 
                <div>No history yet</div>
              }
            </div>
          </div>
          
          <div className="p-4 border rounded">
            <h4 className="font-medium mb-2">Result Array </h4>
            <div className="p-2 rounded">
              {currentState.resultArray && currentState.resultArray.map((subset, idx) => (
                <div key={idx} className="mb-1">
                  Result {idx + 1}: [{subset.join(', ')}]
                </div>
              ))}
              {(!currentState.resultArray || currentState.resultArray.length === 0) && 
                <div>No results yet</div>
              }
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium">DFS Tree Visualization:</h3>
        <div className="overflow-x-auto p-4 border rounded">
          <div className="flex justify-center">
            {treeData && renderTreeNode(treeData)}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium">Generated Subsets:</h3>
        <div className="grid grid-cols-3 gap-2">
          {subsets.map((subset, idx) => (
            <div 
              key={idx} 
              className="p-2 border rounded "
            >
              [{subset.join(', ')}]
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubsetVisualizer;